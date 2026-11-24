const { handleSuccessResponse, handleErrorResponse, CustomError, connection } = require('../config/dbSql');
const asyncHandler = require('../utility/asyncHandler');
const { updateDocCounter } = require('../utility/docNo');
const { formatExcelDate } = require('../utility/utilityFunction');
const excel = require("exceljs");

exports.searchCrNo = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim() === "") {
        throw new CustomError('CR No is required', 400);
    }

    const [rows] = await connection.execute(
        "SELECT id, crNo FROM contract_review WHERE crNo LIKE ?",
        [`%${q.trim()}%`]
    );

    return handleSuccessResponse(res, 'CR No fetched successfully', rows);
});

const fetchItemRate = async (items, fim) => {
    try {
        // Get packing rate once per FIM
        const [fimRows] = await connection.execute(`SELECT packingCharge FROM item_fim_id WHERE name = ?`, [fim]);
        const packingRate = (fimRows.length > 0 && fimRows[0].packingCharge != 0) ? fimRows[0].packingCharge : 0;

        let noOfPacking = 1;
        const promises = items.map(async (item, index) => {
            const { partNo, Qty } = item;

            const [rows] = await connection.execute(`
                SELECT items.id as itemId, items.itemName, items.delLotQty, mst_uom.name as uom, COALESCE(pcn.basicRate, items.stdRate, 0) as basePrice, items.MOQ
                FROM items
                LEFT JOIN mst_uom ON mst_uom.id = items.uom
                LEFT JOIN pcn ON pcn.id = (
                    SELECT pcn2.id
                    FROM pcn pcn2
                    WHERE pcn2.itemCode = items.itemCode
                    ORDER BY pcn2.id DESC
                    LIMIT 1
                )
                WHERE items.itemCode = ?
            `, [partNo]);

            if (rows.length > 0) {
                const { itemId, itemName, uom, basePrice, delLotQty, MOQ } = rows[0];

                let packLot = 1;
                if (Number(Qty) > Number(delLotQty) && Number(delLotQty)) {
                    packLot = Math.max(Math.ceil(Number(Qty) / Number(delLotQty)) - 1, 1);
                    noOfPacking += packLot;
                }
                const itemPackingCharge = parseFloat(packingRate) * packLot;
                const totalRate = basePrice === 0 ? 0 : parseFloat(basePrice) * parseFloat(Qty);
                const colorStatus = basePrice == 0 ? '#f07979ea' : '#84ed84ff';

                item.id = index + 1;
                item.itemId = itemId;
                item.itemName = itemName;
                item.uom = uom;
                item.basicRate = Number(basePrice).toFixed(2);
                item.finalRate = Number(totalRate).toFixed(2);
                item.colorStatus = colorStatus;
                item.itemPackingCharge = itemPackingCharge;
                item.moq = MOQ;
            } else {
                item.id = index + 1;
                item.itemId = null;
                item.itemName = "Not Found in Master";
                item.uom = "";
                item.basicRate = "0.00";
                item.finalRate = "0.00";
                item.colorStatus = '#f07979ea';
                item.itemPackingCharge = 0;
                item.moq = 0;
            }
        });

        await Promise.all(promises);

        // Sum up packing charges from all items
        const totalPackingCharge = noOfPacking * packingRate;
        const finalRate = items.reduce((acc, item) => acc + Number(item.finalRate || 0), 0);
        const totCharge = Number(totalPackingCharge + finalRate).toFixed(2);

        const packingDetails = {
            packingRate,
            noOfPacking,
            packingCharge: totalPackingCharge,
            totCharge
        };

        return { items, finalRate: totCharge, packingDetails };
    } catch (err) {
        throw err;
    }
};

exports.downloadTemplate = asyncHandler(async (req, res) => {
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet("Template");

    const headerRow = worksheet.addRow([
        "CustPONo", "CustPODate", "CustPOLineNo", "itemcode",
        "Qtn Ref", "Qty", "Rate", "SchDate"
    ]);
    headerRow.font = { bold: true, size: 13 };
    headerRow.alignment = { horizontal: "center" };

    worksheet.columns.forEach((column) => {
        column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader("Content-Disposition", 'attachment; filename="ContractReview_Template.xlsx"');
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
});

exports.importExcel = asyncHandler(async (req, res) => {
    if (!req.file) throw new CustomError("No file uploaded", 400);

    const workbook = new excel.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new CustomError("Worksheet not found", 400);

    const rowsData = [];
    const itemCodes = new Set();

    // Step 1: Parse — use eachRow to skip empties, .value for numbers
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return;

        const custPONo = row.getCell(1).text?.trim() || "";
        const itemCode = row.getCell(4).text?.trim() || "";
        if (!custPONo && !itemCode) return;

        const crQty = parseFloat(row.getCell(6).value) || 0;
        const crRate = parseFloat(row.getCell(7).value) || 0;

        rowsData.push({
            rowIndex: rowNumber,
            custPONo,
            custPODate: formatExcelDate(row.getCell(2)),
            custPOLineNo: row.getCell(3).text?.trim() || "",
            itemCode,
            qtnRef: row.getCell(5).text?.trim() || "",
            crQty,
            crRate,
            schDate: formatExcelDate(row.getCell(8)),
        });

        if (itemCode) itemCodes.add(itemCode);
    });

    // Step 2: Bulk fetch master items to validate existence
    const itemMap = new Map();
    if (itemCodes.size > 0) {
        const [dbRows] = await connection.query(`
            SELECT itm.id, itm.itemCode, itm.itemName,
                uom.name AS uom, itm.stdRate, itm.MOQ, itm.revNo
            FROM items itm
            LEFT JOIN mst_uom uom ON uom.id = itm.uom
            WHERE itm.itemCode IN (?)
        `, [Array.from(itemCodes)]);

        for (const item of dbRows) itemMap.set(item.itemCode, item);
    }

    // Step 3: Validate all missing items at once
    const missing = [...new Set(
        rowsData.filter(r => !itemMap.has(r.itemCode)).map(r => r.itemCode)
    )];
    if (missing.length > 0) {
        throw new CustomError(`Items not found in master: ${missing.join(", ")}`, 400);
    }

    // Step 4: Map to output with price comparison
    const dataPromises = rowsData.map(async (row, idx) => {
        const item = itemMap.get(row.itemCode);
        const match = /-.*FIM/.test(row.itemCode);
        let sobRows = [], fim = '';

        if (match) {
            const [contractNo, fimStr] = row.itemCode.split('-');
            fim = fimStr.trim();
            const [dbSobRows] = await connection.execute(
                `SELECT partNo, Qty FROM sob WHERE contractNo = ? AND fimNo = ?`,
                [contractNo, fim]
            );
            sobRows = dbSobRows;
        } else {
            // Standalone item: compare unit rate (Qty = 1)
            sobRows = [{ partNo: row.itemCode, Qty: 1 }];
        }

        const { items: childItems, finalRate, packingDetails } = await fetchItemRate(sobRows, fim);
        const difference = parseFloat(row.crRate) - parseFloat(finalRate);
        const status = (difference >= -1 && difference <= 1) ? 'Verified' : 'Mismatch';
        const colorStatus = (difference >= -1 && difference <= 1) ? '#84ed84ff' : '#f07979ea';

        return {
            id: idx + 1,
            custPoNo: row.custPONo,
            custPoDate: row.custPODate,
            custPoLine: row.custPOLineNo,
            itemId: item.id,
            itemCode: row.itemCode,
            itemName: item.itemName,
            revNo: item.revNo,
            qtnRef: row.qtnRef,
            crQty: row.crQty,
            crRate: row.crRate,
            crAmt: row.crQty * row.crRate,
            schDate: row.schDate,
            uom: item.uom,
            mstPrice: Number(finalRate).toFixed(2),
            mstAmt: Number(parseFloat(finalRate) * row.crQty).toFixed(2),
            moq: item.MOQ,
            difference: Number(difference).toFixed(2),
            status,
            colorStatus,
            child: childItems,
            packingDetails
        };
    });

    const data = await Promise.all(dataPromises);

    return handleSuccessResponse(res, "Excel data fetched successfully", data);
});

exports.store = asyncHandler(async (req, res) => {
    const { docNo, crNo, crDate, customerId, packingIns, statutoryReq, crData } = req.body;

    // Validate required fields
    if (!docNo || !crNo || !crDate || !customerId) {
        throw new CustomError("Missing required fields: docNo, crNo, crDate, customerId", 400);
    }

    const items = typeof crData === 'string' ? JSON.parse(crData) : crData;

    if (!Array.isArray(items) || items.length === 0) {
        throw new CustomError("Contract review details (crData) must be a non-empty array", 400);
    }

    const filePath = req.file ? `contractReview/${req.file.filename}` : null;

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    try {
        // Normalize boolean/integer values
        const packingInsVal = (packingIns === 'true' || packingIns === true || packingIns === 1 || packingIns === '1') ? 1 : 0;
        const statutoryReqVal = (statutoryReq === 'true' || statutoryReq === true || statutoryReq === 1 || statutoryReq === '1') ? 1 : 0;

        // Insert Master Header
        const [mstResult] = await conn.execute(`
            INSERT INTO contract_review (
                docNo, crNo, crDate, customerId, packingIns, statutoryReq, filePath
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [docNo, crNo, crDate, customerId, packingInsVal, statutoryReqVal, filePath]);

        const crMstId = mstResult.insertId;

        // Insert Details
        const placeholders = items.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const detailsQuery = `
            INSERT INTO contract_review_details (
                crMstId, itemId, crQty, crRate, crAmt, custPoNo, custPoDate, custPoLine, moq
            ) VALUES ${placeholders}
        `;

        const detailsValues = items.flatMap(item => {
            return [
                crMstId,
                item.itemId,
                item.crQty,
                item.crRate,
                item.crAmt,
                item.custPoNo || null,
                item.custPoDate,
                item.custPoLineNo || item.custPoLine || null,
                item.moq || null
            ];
        });

        await conn.execute(detailsQuery, detailsValues);
        await updateDocCounter(conn, 'ContractReview');

        await conn.commit();
        return handleSuccessResponse(res, "Contract Review stored successfully");
    } catch (err) {
        await conn.rollback();
        if (err.code === 'ER_DUP_ENTRY') {
            return handleErrorResponse(res, new CustomError(`CR No '${crNo}' already exists`, 400));
        }
        return handleErrorResponse(res, err);
    } finally {
        if (conn) conn.release();
    }
});

exports.update = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { docNo, crNo, crDate, customerId, packingIns, statutoryReq, crData } = req.body;

    if (!id) throw new CustomError("ID is required", 400);

    const items = typeof crData === 'string' ? JSON.parse(crData) : crData;

    if (!Array.isArray(items) || items.length === 0) {
        throw new CustomError("Contract review details (crData) must be a non-empty array", 400);
    }

    const filePath = req.file ? `contractReview/${req.file.filename}` : null;

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    try {
        const packingInsVal = (packingIns === 'true' || packingIns === true || packingIns === 1 || packingIns === '1') ? 1 : 0;
        const statutoryReqVal = (statutoryReq === 'true' || statutoryReq === true || statutoryReq === 1 || statutoryReq === '1') ? 1 : 0;

        // Build dynamic SET clause — only update filePath if a new file was uploaded
        let updateQuery = `
            UPDATE contract_review SET
                docNo = ?, crNo = ?, crDate = ?, customerId = ?,
                packingIns = ?, statutoryReq = ?
                ${filePath ? ', filePath = ?' : ''}
            WHERE id = ?
        `;
        const updateValues = [docNo, crNo, crDate, customerId, packingInsVal, statutoryReqVal];
        if (filePath) updateValues.push(filePath);
        updateValues.push(id);

        const [result] = await conn.execute(updateQuery, updateValues);

        if (result.affectedRows === 0) {
            throw new CustomError("Contract Review not found", 404);
        }

        // Delete old details and re-insert
        await conn.execute("DELETE FROM contract_review_details WHERE crMstId = ?", [id]);

        const placeholders = items.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
        const detailsQuery = `
            INSERT INTO contract_review_details (
                crMstId, itemId, crQty, crRate, crAmt, custPoNo, custPoDate, custPoLine, moq
            ) VALUES ${placeholders}
        `;

        const detailsValues = items.flatMap(item => {
            return [
                id,
                item.itemId,
                item.crQty,
                item.crRate,
                item.crAmt,
                item.custPoNo || null,
                item.custPoDate,
                item.custPoLineNo || item.custPoLine || null,
                item.moq || null
            ];
        });

        await conn.execute(detailsQuery, detailsValues);

        await conn.commit();
        return handleSuccessResponse(res, "Contract Review updated successfully");
    } catch (err) {
        await conn.rollback();
        if (err.code === 'ER_DUP_ENTRY') {
            return handleErrorResponse(res, new CustomError(`CR No '${crNo}' already exists`, 400));
        }
        return handleErrorResponse(res, err);
    } finally {
        if (conn) conn.release();
    }
});

exports.delete = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) throw new CustomError("ID is required", 400);

    const conn = await connection.getConnection();
    await conn.beginTransaction();

    try {
        // Check if record exists and is not authorized
        const [rows] = await conn.execute(
            "SELECT id, authorized FROM contract_review WHERE id = ?", [id]
        );

        if (rows.length === 0) {
            throw new CustomError("Contract Review not found", 404);
        }

        if (rows[0].authorized === 1) {
            throw new CustomError("Cannot delete an authorized Contract Review", 400);
        }

        // Delete details first, then master
        await conn.execute("DELETE FROM contract_review_details WHERE crMstId = ?", [id]);
        await conn.execute("DELETE FROM contract_review WHERE id = ?", [id]);

        await conn.commit();
        return handleSuccessResponse(res, "Contract Review deleted successfully");
    } catch (err) {
        await conn.rollback();
        return handleErrorResponse(res, err);
    } finally {
        if (conn) conn.release();
    }
});

exports.getItems = asyncHandler(async (req, res) => {
    const { type = 'last', id } = req.query;

    const baseQuery = `
        SELECT
            cr.id, cr.docNo, cr.crNo,
            DATE_FORMAT(cr.crDate, '%Y-%m-%d') AS crDate,
            cr.customerId, cust.cName AS customerName, cust.cCode AS customerCode,
            cr.packingIns, cr.statutoryReq, cr.filePath AS file, cr.authorized
        FROM contract_review cr
        LEFT JOIN customer cust ON cr.customerId = cust.id
    `;

    let suffix, params = [];
    switch (type) {
        case 'first': suffix = ` ORDER BY cr.id ASC LIMIT 1`; break;
        case 'last': suffix = ` ORDER BY cr.id DESC LIMIT 1`; break;
        case 'forward': suffix = ` WHERE cr.id > ? ORDER BY cr.id ASC LIMIT 1`; params.push(id); break;
        case 'reverse': suffix = ` WHERE cr.id < ? ORDER BY cr.id DESC LIMIT 1`; params.push(id); break;
        case 'fetchByID': suffix = ` WHERE cr.id = ?`; params.push(id); break;
        default: throw new CustomError("Invalid fetch type", 400);
    }

    let [rows] = await connection.execute(baseQuery + suffix, params);

    // Boundary fallback: stick to last doc on forward overshoot, first doc on backward undershoot
    if (rows.length === 0 && (type === 'forward' || type === 'reverse')) {
        const fallbackSuffix = type === 'forward'
            ? ` ORDER BY cr.id DESC LIMIT 1`
            : ` ORDER BY cr.id ASC LIMIT 1`;
        [rows] = await connection.execute(baseQuery + fallbackSuffix, []);
    }

    if (rows.length === 0) {
        return res.status(200).json({ success: true, data: {}, items: [] });
    }

    const data = rows[0];

    const [items] = await connection.execute(`
        SELECT
            crd.id, crd.crMstId, crd.itemId, crd.crQty, crd.crRate, crd.crAmt,
            crd.custPoNo, DATE_FORMAT(crd.custPoDate, '%Y-%m-%d') AS custPoDate,
            crd.custPoLine, crd.moq,
            itm.itemCode, itm.itemName, uom.name AS uom, itm.stdRate AS mstPrice,
            (itm.stdRate * crd.crQty) AS mstAmt,
            COALESCE(fim.packingInstruction, itm.packingInstruction) as packingInstruction
        FROM contract_review_details crd
        JOIN items itm ON crd.itemId = itm.id
        LEFT JOIN mst_uom uom ON itm.uom = uom.id
        LEFT JOIN item_fim_id fim ON itm.fimId = fim.id
        WHERE crd.crMstId = ?
    `, [data.id]);

    return res.status(200).json({ success: true, data, items });
});

exports.getSuppItm = asyncHandler(async (req, res) => {
    const { id, q } = req.query;
    if (!id) throw new CustomError("Supplier ID is required", 400);

    let query = `
        SELECT 
            item.id,
            item.itemCode,
            item.itemName,
            cust.uom,
            item.stdRate AS mstPrice,
            item.moq
        FROM cust_vs_item cust
        JOIN items item ON cust.itemId = item.id
        WHERE cust.customerId = ?
    `;
    const params = [id];

    if (q) {
        query += ` AND item.itemCode LIKE ?`;
        params.push(`%${q}%`);
    }

    query += ` LIMIT 20`;

    const [rows] = await connection.execute(query, params);
    return handleSuccessResponse(res, 'Customer Item fetched successfully', rows);
});

exports.getPackingInstructions = asyncHandler(async (req, res) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new CustomError("Items array is required");
    }

    const itemCodes = items.map(code => code.trim()).filter(Boolean);
    const placeholders = itemCodes.map(() => '?').join(',');

    const [rows] = await connection.execute(
        `SELECT 
            id, 
            itemCode,
            packingInstruction 
        FROM items
        WHERE itemCode IN (${placeholders})`,
        itemCodes
    );

    return handleSuccessResponse(res, 'Packing Instructions fetched successfully', rows);
});

exports.getItemsByCustomer = asyncHandler(async (req, res) => {
    const { customerId } = req.params;

    if (!customerId) throw new CustomError("Customer ID is required", 400);

    let query = `
        SELECT
            crd.id, cr.docNo, cr.crNo, crd.custPoNo, crd.itemId, itm.itemCode, itm.itemName,uom.name AS uom, hsn.name as hsnCode, crd.crQty AS qty, 
            crd.crQty AS cumQty, DATE_FORMAT(crd.custPoDate, '%Y-%m-%d') AS schDate, crd.crRate AS rate, crd.crAmt AS amt,
            cvih.old_rate AS preRate
        FROM contract_review_details crd
        INNER JOIN contract_review cr ON cr.id = crd.crMstId
        INNER JOIN items itm ON itm.id = crd.itemId
        LEFT JOIN cust_vs_item_history cvih
            ON cvih.itemId = itm.id
            AND cvih.customerId = ?
        LEFT JOIN mst_uom uom ON uom.id = itm.uom
        LEFT JOIN item_hsn_code hsn ON hsn.id = itm.hsnCode
        WHERE cr.customerId = ? AND crd.isUsedInSo = 0
    `;
    const params = [customerId, customerId];

    const [rows] = await connection.execute(query, params);
    return handleSuccessResponse(res, 'Contract Review items fetched successfully', rows);
});

// Call once a CR line item has actually been saved onto a Sales Order — flips
exports.markUsedInSo = async (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw new CustomError("Items array is required", 400);
    }

    const crIds = items
        .filter(item => item?.crNo && item?.id)
        .map(item => item.id);

    if (crIds.length === 0) {
        return { updatedCount: 0 };
    }

    const placeholders = crIds.map(() => "?").join(",");

    const [result] = await connection.execute(
        `UPDATE contract_review_details
         SET isUsedInSo = 1
         WHERE id IN (${placeholders})`,
        crIds
    );

    return {
        updatedCount: result.affectedRows
    };
};

exports.getStatutoryRequirement = asyncHandler(async (req, res) => {
    const customerId = req.params.customerId;

    if (!customerId) throw new CustomError("Customer ID is required", 400);

    const [rows] = await connection.execute(
        `SELECT id, statutoryReq FROM customer WHERE id = ?`,
        [customerId]
    );

    return handleSuccessResponse(res, 'Statutory Requirement fetched successfully', rows);
});
