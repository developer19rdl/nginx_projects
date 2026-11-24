const { handleErrorResponse, connection, CustomError, handleSuccessResponse } = require("../config/dbSql");
const { updateDocCounter } = require("../utility/docNo");
const { getUser, updateCounter } = require("../utility/utilityFunction");
const { generateSrnNo, insertSrnItems } = require("./srnController");

// Unique FIM's
const getFimList = async () => {
    const [rows] = await connection.execute(
        `SELECT name FROM item_fim_id WHERE dflag = '0'`
    );

    // Extract FIM suffixes
    const suffixSet = new Set();
    const fimArray = [];

    rows.forEach(row => {
        const index = row.name.indexOf("FIM");
        if (index !== -1) {
            const suffix = row.name.substring(index);
            if (!suffixSet.has(suffix)) {
                suffixSet.add(suffix);
                fimArray.push(suffix);
            }
        }
    });

    return fimArray;
}


// Main Item details
exports.fetchMainItemDetails = async (itemId) => {
    const query = `
        SELECT items.itemCode, items.isBom as isBomMainItem, items.category,
            CASE WHEN items.category IN ('MAKE', 'BUY', 'BUY LC-S') THEN 1 ELSE 0 END as generateSrnMainItem,
            CASE WHEN items.category = 'BUY PRODUCTION' THEN 1 ELSE 0 END as buyProdMain
        FROM items
        WHERE items.id = ?;
    `;
    const [bomMst] = await connection.execute(query, [itemId]);
    return bomMst[0];
};

// Child Item details
exports.fetchItemsDetails = async (bomMstId, sobQty) => {
    const query = `
        SELECT items.id as itemId, items.itemCode, items.isBom, (bom.Qty * ?) as bomQty,
            CASE WHEN items.category IN ('MAKE', 'BUY', 'BUY LC-S') THEN 1 ELSE 0 END as generateSrn,
            CASE WHEN items.category = 'BUY PRODUCTION' THEN 1 ELSE 0 END as buyProd
        FROM bom
        INNER JOIN bom_mst ON bom_mst.id = bom.bomMstId
        INNER JOIN items ON items.id = bom.itemId
        WHERE bom_mst.itemId = ?
    `;
    const [bom] = await connection.execute(query, [sobQty, bomMstId]);
    return bom;
};

// Recursive function to fetch child details
exports.childItems = async (sobId, bomMstId, bomMstItemCode, fim, bomMstQty, saleOrderId = null) => {
    try {
        const itemsList = [];

        const { isBomMainItem, generateSrnMainItem } = await this.fetchMainItemDetails(bomMstId);

        if (generateSrnMainItem) {
            itemsList.push({ sobId, itemId: bomMstId, itemCode: bomMstItemCode, Qty: bomMstQty, fim, saleOrderId });
        }

        if (isBomMainItem === 'Y') {
            const bomItemDetails = await this.fetchItemsDetails(bomMstId, bomMstQty);

            await Promise.all(bomItemDetails.map(async (item) => {
                const { itemId, itemCode, isBom, bomQty, generateSrn } = item;

                if (isBom === 'Y') {
                    const { itemsList: childParts } = await this.childItems(sobId, itemId, itemCode, fim, bomQty, saleOrderId); // Recursive call
                    itemsList.push(...childParts);
                } else {
                    if (generateSrn) {
                        itemsList.push({ sobId, itemId, itemCode, Qty: bomQty, fim, saleOrderId });
                    }
                }
            }));
        }

        return { itemsList };
    } catch (error) {
        throw error;
    }
}

exports.groupItemsByCode = async (itemsList, type) => {
    const groupedItems = new Map();

    itemsList.forEach(row => {
        const { itemId, itemCode, Qty, fim, sobId } = row;
        const key = type === 'Assembly' ? `${fim}_${itemId}` : itemId;
        const contribution = { sobId, qty: Number(Qty) };

        if (groupedItems.has(key)) {
            const item = groupedItems.get(key);
            groupedItems.set(key, {
                ...item,
                Qty: Number(item.Qty) + Number(Qty),
                contributions: [...item.contributions, contribution]
            });
        } else {
            groupedItems.set(key, { ...row, contributions: [contribution] });
        }
    });

    return Array.from(groupedItems.values());
}

exports.storeRequestNote = async (conn, req, orderPlnId, mrpMstId) => {
    try {
        const fimList = await getFimList();
        const finalSet = [];

        //console.log('SRN started...');

        for (const fim of fimList) {
            const fetchQuery = `
                SELECT sob.id AS sobId, items.id as itemId, items.itemCode, sob.fimNo as fim, sob.Qty as Qty
                FROM sob
                INNER JOIN items ON items.itemCode = sob.partNo
                INNER JOIN order_plannings op ON op.sobMstId = sob.sobMstId
                WHERE op.id = ? AND sob.fimNo LIKE ?
            `;
            // WHERE op.id = ? AND sob.fimNo LIKE ? AND items.jcPart = 'Y'

            //jcPart label in the fromtend rename as "Is Batch Production Part" just for reference

            const [items] = await conn.execute(fetchQuery, [orderPlnId, `%${fim}`]);

            const itemsList = [];

            await Promise.all(items.map(async element => {
                const { sobId, itemId, itemCode, Qty } = element;

                const { isBomMainItem, generateSrnMainItem } = await this.fetchMainItemDetails(itemId);

                if (generateSrnMainItem) {
                    itemsList.push({ sobId, itemId, itemCode, Qty, fim });
                }

                if (isBomMainItem === 'Y') {
                    const bomItemDetails = await this.fetchItemsDetails(itemId, Qty);
                    await Promise.all(bomItemDetails.map(async item => {
                        const { itemId, itemCode, isBom, bomQty, generateSrn } = item;

                        if (isBom === 'Y') {
                            const { itemsList: childParts } = await this.childItems(sobId, itemId, itemCode, fim, bomQty);
                            itemsList.push(...childParts);
                        } else {
                            if (generateSrn) itemsList.push({ sobId, itemId, itemCode, Qty: bomQty, fim });
                        }
                    }));
                }
            }));

            finalSet.push(...await this.groupItemsByCode(itemsList, 'Assembly'));
        }
        // BUY PRODUCTION
        const buyProdSet = await BuyProductionSRN(conn, mrpMstId);

        const srnMstId = await Promise.all([
            this.handleInsertSRN(conn, req, finalSet, mrpMstId, null, null, null, 'Assembly'),
            this.handleInsertSRN(conn, req, buyProdSet, mrpMstId, null, null, null, 'BUY PRODUCTION')
        ]);

        //console.log('SRN successful.');
        return srnMstId[0]; // Return Assembly SRN ID
    } catch (err) {
        throw err;
    }
};

const insertSrnIssue = async (conn, mrpMstId) => {
    await conn.execute(`
        INSERT INTO srn_issue (jcId, itemId, reqQty)
        SELECT
            m.jcId,
            m.itemId,
            SUM(m.Qty) AS reqQty
        FROM mrp m
        INNER JOIN items i ON i.id = m.itemId
        WHERE m.mrpMstId = ?
          AND i.category = 'BUY PRODUCTION' AND jcId IS NOT NULL
        GROUP BY m.jcId, m.itemId
        ON DUPLICATE KEY UPDATE
            reqQty = VALUES(reqQty)
    `, [mrpMstId]);
};

const BuyProductionSRN = async (conn, mrpMstId) => {
    try {
        // One row per contributing orderlist/sob line (via mrp_order_list, not the
        // comma-joined mrp.orderListId string) so each sob's own Qty is preserved
        // instead of being blended by a SQL-level GROUP BY.
        const [mrpRows] = await conn.execute(`
            SELECT
                i.id as itemId,
                m.itemCode,
                m.fim,
                ol.Qty AS Qty,
                jc.jcNo AS jcNo,
                ol.sobId
            FROM mrp m
            INNER JOIN items i ON i.id = m.itemId
            INNER JOIN mrp_order_list mol ON mol.mrpId = m.id
            INNER JOIN orderlist ol ON ol.id = mol.orderId
            LEFT JOIN job_card jc ON jc.id = m.jcId
            WHERE m.mrpMstId = ? AND i.category = ? AND m.jcId IS NOT NULL
        `, [mrpMstId, 'BUY PRODUCTION']);

        const grouped = new Map();
        mrpRows.forEach(row => {
            const { itemId, itemCode, fim, Qty, jcNo, sobId } = row;
            const key = `${fim}_${itemId}`;
            const contribution = { sobId, qty: Number(Qty) };

            if (grouped.has(key)) {
                const item = grouped.get(key);
                item.Qty += Number(Qty);
                item.contributions.push(contribution);
                if (jcNo) item.jcNoSet.add(jcNo);
            } else {
                const jcNoSet = new Set();
                if (jcNo) jcNoSet.add(jcNo);
                grouped.set(key, { itemId, itemCode, fim, Qty: Number(Qty), contributions: [contribution], jcNoSet });
            }
        });

        const mrpItems = Array.from(grouped.values()).map(item => ({
            itemId: item.itemId,
            itemCode: item.itemCode,
            fim: item.fim,
            Qty: item.Qty,
            jcNos: Array.from(item.jcNoSet).sort().join(', '),
            contributions: item.contributions
        }));

        const [jcItems] = await conn.execute(`
            SELECT
                i.id as itemId,
                jc.itemCode,
                fim.name AS fim,
                jc.Qty,
                jc.jcNo AS jcNos,
                ol.sobId
            FROM job_card jc
            INNER JOIN items i ON i.id = jc.itemId
            INNER JOIN orderlist ol ON ol.id = jc.orderListId
            LEFT JOIN item_fim_id fim ON fim.id = i.fimId
            WHERE jc.mrpMstId = ? AND i.category = ?
        `, [mrpMstId, 'BUY PRODUCTION']);

        const jcItemsWithContributions = jcItems.map(item => ({
            ...item,
            contributions: [{ sobId: item.sobId, qty: Number(item.Qty) }]
        }));

        await insertSrnIssue(conn, mrpMstId);

        return [...mrpItems, ...jcItemsWithContributions];
    } catch (err) {
        throw err;
    }
}

exports.handleInsertSRN = async (conn, req, srnItems, mrpMstId, orderId, fimNo, kanbanDate, srnType) => {
    try {
        const { srn, issue } = await generateSrnNo(req);
        const requestedBy = await getUser(req);

        const insertedSrnId = await insertSrnItems(conn, req, mrpMstId, orderId, srn, issue, fimNo, kanbanDate, requestedBy, srnItems, srnType);

        return insertedSrnId;
    } catch (err) {
        throw err;
    }
}

exports.srnRequest = async (req, res) => {
    const conn = await connection.getConnection();
    await conn.beginTransaction();

    try {
        const { orderPlnId, mrpMstId } = req.body;
        await this.storeRequestNote(conn, req, orderPlnId, mrpMstId);

        await conn.commit();
        return handleSuccessResponse(res, 'Success');
    } catch (err) {
        await conn.rollback();
        return handleErrorResponse(res, err);
    } finally {
        conn.release();
    }
}