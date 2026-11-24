const { connection, CustomError, handleSuccessResponse, handleErrorResponse } = require("../config/dbSql");
const { fetchItemsDetails, childItems, fetchMainItemDetails, groupItemsByCode, handleInsertSRN } = require("./storeReqController");
const asyncHandler = require("../utility/asyncHandler");

exports.assemblySrn = async (req, res) => {
    const conn = await connection.getConnection();
    await conn.beginTransaction();

    try {
        const { saleId, kanbanDate } = req.body;

        const [sales] = await conn.execute(`
            SELECT s.id, so.id as saleOrderId, s.saleId, s.generateSrn, s.fim, so.refNo, so.itemId, items.itemCode, so.Qty 
            FROM sales s
            INNER JOIN salesorder so ON so.saleId = s.saleId
            INNER JOIN items ON items.id = so.itemId
            WHERE s.id = ? AND s.processed = ?`,
            [saleId, 0]
        )

        if (sales.length === 0) {
            throw new CustomError(`Request already processed!`, 404);
        }

        const { fim: fimNo, generateSrn } = sales[0];
        let srnMstId = null;

        if (generateSrn) {
            const itemsList = [];
            await Promise.all(sales.map(async (element) => {
                const { saleOrderId, itemId, itemCode, Qty, fim } = element;

                // Fetch main item details
                const { isBomMainItem, generateSrnMainItem } = await fetchMainItemDetails(itemId);

                if (generateSrnMainItem) {
                    itemsList.push({ saleOrderId, itemId, itemCode, Qty, fim });
                }

                if (isBomMainItem === 'Y') {
                    // Fetch child items
                    const bomItemDetails = await fetchItemsDetails(itemId, Qty);

                    await Promise.all(bomItemDetails.map(async (item) => {
                        const { itemId, itemCode, isBom, bomQty, generateSrn } = item;

                        if (isBom === 'Y') {
                            const { itemsList: childParts } = await childItems(null, itemId, itemCode, fim, bomQty, saleOrderId); // Recursive call
                            itemsList.push(...childParts);
                        } else {
                            if (generateSrn) {
                                itemsList.push({ saleOrderId, itemId, itemCode, Qty: bomQty, fim });
                            }
                        }
                    }));
                }
            }));
            // groupItemsByCode
            const finalSet = await groupItemsByCode(itemsList);

            // Store SRN
            srnMstId = await handleInsertSRN(conn, req, finalSet, null, saleId, fimNo, kanbanDate, 'Assembly');
        }
        await assemblyPlanning(conn, srnMstId, kanbanDate, sales);

        await conn.execute(`UPDATE sales SET processed = ? WHERE id = ?`, [1, saleId]);

        await conn.commit();

        return handleSuccessResponse(res, 'Srn successful')
    } catch (err) {
        await conn.rollback();
        return handleErrorResponse(res, err);
    } finally {
        conn.release();
    }
}

const insertSrnIssueFromSrn = async (conn, srnMstId) => {
    await conn.execute(`
        INSERT INTO srn_issue (jcId, asmPlnId, srnId, itemId, reqQty)
        SELECT
            NULL AS jcId,
            NULL AS asmPlnId,
            s.id AS srnId,
            s.itemId,
            s.Qty AS reqQty
        FROM srn s
        WHERE s.srnMstId = ?
        ON DUPLICATE KEY UPDATE
            reqQty = VALUES(reqQty)
    `, [srnMstId]);
};

const assemblyPlanning = async (conn, srnMstId, shipmentDate, items) => {
    try {
        const placeholders = items.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');

        const assemblyQuery = `
            INSERT INTO assembly_planning
            (saleMstId, srnMstId, saleOrderId, shipmentDate, fim, refNo, itemId, itemCode, Qty)
            VALUES ${placeholders}
        `;

        const assemblyValues = items.flatMap(i => [
            i.id,
            srnMstId,
            i.saleOrderId,
            shipmentDate,
            i.fim,
            i.refNo,
            i.itemId,
            i.itemCode,
            i.Qty
        ]);

        await conn.execute(assemblyQuery, assemblyValues);

        // Insert SRN → SRN Issue
        await insertSrnIssueFromSrn(conn, srnMstId);

    } catch (err) {
        throw err;
    }
};

// FIFO waterfall: a srn line's issuedQty is tracked once for the whole pooled
const allocateIssuedQtyFifo = (contributions, totalIssuedQty) => {
    const sorted = [...contributions].sort((a, b) => a.sobId - b.sobId);
    let remaining = Number(totalIssuedQty) || 0;
    const allocations = new Map();

    for (const { sobId, qty } of sorted) {
        const allocated = Math.min(remaining, Number(qty));
        allocations.set(sobId, allocated);
        remaining -= allocated;
    }

    return allocations;
};

const issueStatusFor = (allocatedQty, requiredQty) => {
    if (allocatedQty >= requiredQty) return 'Fully Issued';
    if (allocatedQty > 0) return 'Partially Issued';
    return 'Not Issued';
};

const fetchSrnSobMapItems = async (sobIdParam) => {
    const sobId = Number(sobIdParam);

    const [rows] = await connection.execute(`
        SELECT s.id AS srnId, s.itemCode, i.category, s.fim, s.jcNos,
               COALESCE(s.issueNo, s.grn) AS grn,
               COALESCE(s.issuedQty, 0) AS totalIssuedQty, ssm.qty AS srnQty
        FROM srn s
        INNER JOIN srn_sob_map ssm ON ssm.srnId = s.id
        INNER JOIN items i ON i.id = s.itemId
        WHERE ssm.sobId = ? AND s.shortClose = 0
    `, [sobId]);

    if (!rows.length) return [];

    const srnIds = rows.map(r => r.srnId);
    const placeholders = srnIds.map(() => '?').join(', ');

    const [mapRows] = await connection.execute(`
        SELECT srnId, sobId, qty FROM srn_sob_map WHERE srnId IN (${placeholders})
    `, srnIds);

    const contributionsBySrnId = new Map();
    mapRows.forEach(({ srnId, sobId: contribSobId, qty }) => {
        if (!contributionsBySrnId.has(srnId)) contributionsBySrnId.set(srnId, []);
        contributionsBySrnId.get(srnId).push({ sobId: contribSobId, qty: Number(qty) });
    });

    return rows.map(row => {
        const contributions = contributionsBySrnId.get(row.srnId) || [];
        const allocations = allocateIssuedQtyFifo(contributions, row.totalIssuedQty);
        const srnQty = Number(row.srnQty);
        const issuedQty = Math.min(allocations.get(sobId) || 0, srnQty);

        return {
            id: row.srnId,
            jcNo: null,
            itemCode: row.itemCode,
            category: row.category,
            fim: row.fim,
            jcNos: row.jcNos,
            grn: row.grn,
            srnQty,
            issuedQty,
            issueStatus: issueStatusFor(issuedQty, srnQty)
        };
    });
};

const fetchAssemblySobItems = async (sobIdParam) => {
    const sobId = Number(sobIdParam);

    // Job-card-linked route: items reachable via job_card for this sob, matched
    const [items, [jcRows]] = await Promise.all([
        fetchSrnSobMapItems(sobId),
        connection.execute(`
            SELECT
                s.id, jc.jcNo, s.itemCode, i.category, SUM(s.Qty) AS srnQty, s.fim,
                COALESCE(s.issueNo, s.grn) AS grn,
                LEAST(COALESCE(s.issuedQty, 0), SUM(s.Qty)) AS issuedQty,
                CASE
                    WHEN COALESCE(s.issuedQty, 0) >= SUM(s.Qty) THEN 'Fully Issued'
                    WHEN COALESCE(s.issuedQty, 0) > 0 THEN 'Partially Issued'
                    ELSE 'Not Issued'
                END AS issueStatus
            FROM orderlist ol
            INNER JOIN job_card jc ON jc.orderListId = ol.id
            INNER JOIN srn_mst sm ON sm.mrpMstId = jc.mrpMstId
            INNER JOIN srn s ON s.srnMstId = sm.id AND s.itemId = jc.itemId AND s.shortClose = 0
            INNER JOIN items i ON i.id = jc.itemId
            WHERE ol.sobId = ?
            GROUP BY jc.jcNo, s.itemId
        `, [sobId])
    ]);

    const seen = new Set(jcRows.map(r => r.itemCode));
    return [...items.filter(r => !seen.has(r.itemCode)), ...jcRows];
};

// Unlike fetchAssemblySobItems (used by the other two endpoints below), this
// doesn't split a blended srn line's Qty across contributing sobs via
// srn_sob_map — it filters srn.sobId directly (the first/primary contributing
// sob recorded on the row) and returns that line's full cumulated Qty as-is.
exports.getAssemblyItemDetails = asyncHandler(async (req, res) => {
    const { sobId } = req.query;

    const [[rows], [jcRows], sobRows] = await Promise.all([
        connection.execute(`
            SELECT s.id, s.itemCode, i.category, s.fim, s.jcNos,
                   COALESCE(s.issueNo, s.grn) AS grn,
                   s.Qty AS srnQty,
                   LEAST(COALESCE(s.issuedQty, 0), s.Qty) AS issuedQty,
                   CASE
                       WHEN COALESCE(s.issuedQty, 0) >= s.Qty THEN 'Fully Issued'
                       WHEN COALESCE(s.issuedQty, 0) > 0 THEN 'Partially Issued'
                       ELSE 'Not Issued'
                   END AS issueStatus
            FROM srn s
            INNER JOIN items i ON i.id = s.itemId
            WHERE s.sobId = ? AND s.shortClose = 0
        `, [sobId]),
        connection.execute(`
            SELECT
                s.id, jc.jcNo, s.itemCode, i.category, SUM(s.Qty) AS srnQty, s.fim,
                COALESCE(s.issueNo, s.grn) AS grn,
                LEAST(COALESCE(s.issuedQty, 0), SUM(s.Qty)) AS issuedQty,
                CASE
                    WHEN COALESCE(s.issuedQty, 0) >= SUM(s.Qty) THEN 'Fully Issued'
                    WHEN COALESCE(s.issuedQty, 0) > 0 THEN 'Partially Issued'
                    ELSE 'Not Issued'
                END AS issueStatus
            FROM orderlist ol
            INNER JOIN job_card jc ON jc.orderListId = ol.id
            INNER JOIN srn_mst sm ON sm.mrpMstId = jc.mrpMstId
            INNER JOIN srn s ON s.srnMstId = sm.id AND s.itemId = jc.itemId AND s.shortClose = 0
            INNER JOIN items i ON i.id = jc.itemId
            WHERE ol.sobId = ?
            GROUP BY jc.jcNo, s.itemId
        `, [sobId]),
        fetchSrnSobMapItems(sobId)
    ]);

    const seen = new Set(jcRows.map(r => r.itemCode));
    const results = [...rows.filter(r => !seen.has(r.itemCode)), ...jcRows];
    const seenRes = new Set(results.map(r => r.itemCode));
    const finalResults = [...sobRows.filter(r => !seenRes.has(r.itemCode)), ...results];

    return handleSuccessResponse(res, 'Assembly rows', finalResults);
});

exports.getAssemblyFimDetails = asyncHandler(async (req, res) => {
    const { id } = req.query;

    // Both queries join orderlist inline — no sequential pre-fetch, true parallel execution
    const [results] = await connection.execute(`
           SELECT
                s.id, s.itemCode, i.category, SUM(s.Qty) AS srnQty, s.fim,
                COALESCE(s.issueNo, s.grn)                          AS grn,
                LEAST(COALESCE(s.issuedQty, 0), SUM(s.Qty))             AS issuedQty,
                CASE
                    WHEN COALESCE(s.issuedQty, 0) >= SUM(s.Qty) THEN 'Fully Issued'
                    WHEN COALESCE(s.issuedQty, 0) > 0      THEN 'Partially Issued'
                    ELSE                                         'Not Issued'
                END AS issueStatus
            FROM assembly_planning ap
            INNER JOIN srn_mst sm ON sm.id = ap.srnMstId
            INNER JOIN srn s ON s.srnMstId = sm.id AND s.saleOrderId = ap.saleOrderId AND s.shortClose = 0
            INNER JOIN items i ON i.id = s.itemId
            WHERE ap.id = ?
            GROUP BY s.itemId
        `, [id])

    return handleSuccessResponse(res, 'Assembly rows', results);
});

exports.assemblyUpdateStatus = asyncHandler(async (req, res) => {
    const { sobId } = req.query;

    const results = await fetchAssemblySobItems(sobId);
    const updateStatus = results.every(r => r.issueStatus === 'Fully Issued');

    return res.status(200).json({
        success: true,
        updateStatus
    });
});

exports.getAssemblySobChildItems = asyncHandler(async (req, res) => {
    const { sobId, fim } = req.query;

    const results = await fetchAssemblySobItems(sobId);
    const childItems = results.filter(r => r.fim === fim);

    return handleSuccessResponse(res, 'Assembly child items', childItems);
});