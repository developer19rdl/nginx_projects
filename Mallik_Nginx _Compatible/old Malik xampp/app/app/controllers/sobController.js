const { connection, CustomError, handleErrorResponse, handleSuccessResponse } = require('../config/dbSql');
const asyncHandler = require('../utility/asyncHandler');
const { formatDate } = require('../utility/utilityFunction');
const { npdPlan } = require('./npdPlanController');


exports.store = async (req, res) => {
    try {
        const data = req.body;

        const values = [data.contractNo, data.fimNo, data.msd, data.sheetName];
        const [rows, fields] = await connection.execute('INSERT INTO sob (contractNo, fimNo, msd, sheetName) VALUES (?, ?, ?, ?)', values);

        if (rows.affectedRows > 0) {
            //console.log(fields)
            return res.status(200).json({ success: true, message: "Successfully added" });
        } else {
            return res.status(400).json({ success: false, message: "Execution failed!" });
        }

    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
}



exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;

        const values = [data.contractNo, data.fimNo, data.msd, data.sheetName, id];
        const [rows, fields] = await connection.execute(
            'UPDATE sob SET contractNo = ?, fimNo = ?, msd = ?, sheetName = ? WHERE id = ?',
            values
        );

        if (rows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Successfully updated" });
        } else {
            return res.status(404).json({ success: false, message: "SOB not found!" });
        }

    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};



exports.delete = async (req, res) => {
    try {
        const id = req.params.id;

        const [rows, fields] = await connection.execute('DELETE from sob WHERE id = ?', [id]);

        if (rows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Successfully deleted" });
        } else {
            return res.status(404).json({ success: false, message: "SOB not found!" });
        }

    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};



exports.show = async (req, res) => {
    try {
        const cslMstId = req.params.id;

        const [rows] = await connection.execute(`
            SELECT s.id, s.contractNo, s.partNo, s.fimNo, s.Qty, cm.product
            FROM sob s
            INNER JOIN csl_mst cm ON cm.id = s.cslMstId
            WHERE s.cslMstId = ?`,
            [cslMstId]
        );

        return handleSuccessResponse(res, 'SOB lists', rows);
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};

exports.consolidateSob = async (req, res) => {
    try {
        const sobMstId = req.body.id;

        const [[allRows], [cslList]] = await Promise.all([
            connection.execute(
                `
                SELECT s.id, s.contractNo, s.partNo, s.fimNo, s.Qty, cm.product, s.npdCheck
                FROM sob s
                INNER JOIN csl_mst cm ON cm.id = s.cslMstId
                WHERE s.sobMstId = ?
                `,
                [sobMstId]
            ),
            connection.execute(
                `
                SELECT id
                FROM missing_csl
                WHERE sobMstId = ?
                  AND dflag = ?
                LIMIT 1
                `,
                [sobMstId, '0']
            )
        ]);

        if (!allRows.length) {
            throw new CustomError('Sob not found!', 404);
        }

        const sobRows = [];
        const npdRows = [];
        let hasUnmappedProduct = false;

        for (const { npdCheck, ...row } of allRows) {
            if (npdCheck === 2) continue; // Skip deleted NPD items
            if (row.product === null) hasUnmappedProduct = true;
            (npdCheck === 1 ? npdRows : sobRows).push(row);
        }

        return res.status(200).json({
            success: true,
            message: "SOB lists",
            data: sobRows,
            missingCsl: cslList.length > 0 ? 1 : 0,
            hasUnmappedProduct,
            npdRows
        });

    } catch (err) {
        return handleErrorResponse(res, err);
    }
};

const npdItemList = async (sobMstId) => {
    const [npdResult] = await connection.execute(
        `
            SELECT s.id, s.contractNo, s.partNo, s.fimNo, s.Qty, cm.product, s.npdCheck
            FROM sob s
            INNER JOIN csl_mst cm ON cm.id = s.cslMstId
            WHERE s.sobMstId = ? AND s.npdCheck = 1
        `, [sobMstId]
    );

    return npdResult;
}

exports.resetNpdCheck = async (req, res) => {
    try {
        const sobMstId = req.body.id;

        if (!sobMstId) {
            throw new CustomError('sobMstId is required', 400);
        }

        const [result] = await connection.execute(
            `
            UPDATE sob s
            LEFT JOIN items i ON i.itemCode = s.partNo
            LEFT JOIN item_product_family pf ON pf.id = i.productFamily
            SET s.npdCheck = 0
            WHERE s.sobMstId = ?
              AND s.npdCheck != 0
              AND (pf.name IS NULL OR pf.name != 'NPD')
            `,
            [sobMstId]
        );

        const npdResult = await npdItemList(sobMstId);

        return handleSuccessResponse(res, 'Npd Check reset successfully', npdResult);
    } catch (err) {
        return handleErrorResponse(res, err);
    }
};

exports.deleteNpdItems = async (req, res) => {
    try {
        const { sobMstId, sobIds } = req.body;

        if (!sobIds.length) {
            throw new CustomError('sobIds is required', 400);
        }

        await connection.execute(
            `UPDATE sob SET npdCheck = 2 WHERE id IN (${sobIds.join(',')}) `
            , sobIds
        );

        const npdResult = await npdItemList(sobMstId);

        return handleSuccessResponse(res, '', npdResult);
    } catch (err) {
        return handleErrorResponse(res, err);
    }
}

exports.missingCsl = async (req, res) => {
    const conn = await connection.getConnection(); // for transaction safety

    try {
        const { sobMstId, q } = req.query;

        if (!sobMstId) {
            return res.status(400).json({
                success: false,
                message: "sobMstId is required"
            });
        }

        // ✅ Step 1: Optimized UPDATE (only necessary rows)
        await conn.execute(`
            UPDATE missing_csl ms
            JOIN items i ON i.itemCode = ms.itemCode
            SET ms.dflag = '1'
            WHERE ms.dflag != '1'
        `);

        // ✅ Step 2: Optimized SELECT
        let query = `
            SELECT 
                ms.id,
                cm.contractNo,
                ms.itemCode,
                ms.description,
                ms.Qty,
                ms.fim
            FROM missing_csl ms
            JOIN csl_mst cm ON cm.id = ms.cslMstId
            WHERE ms.sobMstId = ?
              AND ms.dflag = '0'
        `;

        const values = [sobMstId];

        if (q) {
            query += `
                AND (
                    ms.fim IS NULL 
                    OR ms.fim LIKE CONCAT(?, '%')
                )
            `;
            values.push(q);
        }

        const [rows] = await conn.execute(query, values);

        return handleSuccessResponse(res, "Missing CSL lists", rows);
    } catch (err) {
        return handleErrorResponse(res, err);
    } finally {
        conn.release();
    }
};


exports.deleteMissingCsl = async (req, res) => {
    try {
        const itemId = req.body.itemId;
        const itemsList = req.body.itemsList;
        const remarks = req.body.remark;

        if (!itemId && !itemsList) {
            throw new CustomError('Select Items to delete!', 400);
        } else if (itemId && (!itemsList || itemsList.length === 0)) {
            itemsList.push(itemId) // Assign a new array containing `itemId`
        }

        //console.log(itemsList);
        for (const item of itemsList) {
            const [fRows] = await connection.execute('SELECT * FROM missing_csl WHERE id = ?', [item]);

            if (fRows.length === 0) throw new CustomError('Item not found!', 404);
            const data = fRows[0];
            await connection.execute(`UPDATE missing_csl SET dflag = ?, remarks = ? WHERE id = ?`, ['1', remarks, item]);
            await connection.execute(`DELETE FROM sob WHERE sobMstId = ? and cslMstId = ? and partNo = ?`, [data.sobMstId, data.cslMstId, data.itemCode]);
        }

        return res.status(200).json({ success: true, message: "Successfully deleted" });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal server error" });
    }
};



exports.moveItems = async (req, res) => {
    const conn = await connection.getConnection();
    await conn.beginTransaction();

    try {
        const data = req.body.data;

        if (data.length === 0) throw new CustomError('Please select items!', 500);

        const items = [];
        for (const item of data) {
            // const [rows] = await connection.execute(`SELECT * FROM missing_csl WHERE id = ?`, [item]);
            const [rows] = await conn.execute(`
                SELECT ms.*, cm.contractNo
                FROM missing_csl ms 
                INNER JOIN csl_mst cm ON cm.id = ms.cslMstId
                WHERE ms.id = ?
            `, [item]);

            if (rows.length === 0) throw new CustomError('Item Id not found!', 404);
            items.push(...rows);
        }

        const insertQuery = `INSERT INTO r_and_d (sobMstId, cslMstId, itemCode, description, Qty, fim) VALUES ?`;
        const values = items.map(item => [item.sobMstId, item.cslMstId, item.itemCode, item.description, item.Qty, item.fim ?? null]);

        await conn.query(insertQuery, [values]);

        const placeholders = data.map(() => '?').join(',');
        await conn.execute(`DELETE FROM missing_csl WHERE id IN (${placeholders})`, data);

        // //console.log(items)
        await npdPlan(conn, req, items);
        await conn.commit();

        return handleSuccessResponse(res, 'Successfully moved to R&D');
    } catch (err) {
        await conn.rollback();
        return handleErrorResponse(res, err);
    } finally {
        conn.release();
    }
};


exports.deletedItems = async (req, res) => {
    try {
        const [dRows] = await connection.execute(`SELECT * FROM missing_csl WHERE dflag = '1' AND DATE(created_at) = CURDATE()`, []);

        if (dRows.length >= 0) {
            return res.status(200).json({ success: true, message: "Deleted Items", data: dRows });
        }
        throw new CustomError('Something went wrong!', 400);

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal server error" });
    }
};


exports.resAndDev = async (req, res) => {
    try {
        const [rows] = await connection.execute(`SELECT * FROM r_and_d WHERE DATE(created_at) = CURDATE()`, []);

        if (rows.length >= 0) {
            return res.status(200).json({ success: true, message: "R & D Items list", data: rows });
        }
        throw new CustomError('Something went wrong!', 400);

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal server error" });
    }
};


exports.resAndDevAll = async (req, res) => {
    try {
        const [rows] = await connection.execute(`SELECT * FROM r_and_d`, []);

        if (rows.length >= 0) {
            return res.status(200).json({ success: true, message: "R & D Items list", data: rows });
        }
        throw new CustomError('Something went wrong!', 400);

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal server error" });
    }
};


exports.fetchSob = async (req, res) => {
    try {
        const { fromDate, toDate } = req.body;

        let query = `
            SELECT ROW_NUMBER() OVER (ORDER BY sm.created_at ASC) AS sId, sm.id, sm.sobNo, DATE_FORMAT(sm.created_at, '%d-%m-%Y') AS created_at, sm.processed, sm.mapStatus
            FROM sob_mst sm
            LEFT JOIN order_plannings op ON op.sobMstId = sm.id
        `;
        let queryParams = [];

        if (fromDate && toDate) {
            query += ` WHERE DATE(sm.created_at) BETWEEN ? AND ?`;
            queryParams.push(fromDate, toDate);
        } else {
            query += ` WHERE DATE(sm.created_at) = CURDATE()`;
        }

        const [rows] = await connection.execute(query, queryParams);

        return res.status(200).json({ success: true, message: "SOB lists", data: rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};



exports.showFim = async (req, res) => {
    try {
        const { sobMstId } = req.query;
        const [rows] = await connection.execute(`SELECT DISTINCT fim FROM missing_csl WHERE sobMstId = ? AND dflag = '0' AND fim IS NOT null`, [sobMstId]);

        // rows.forEach((row, index) => {
        //     row.id = index + 1;
        // });

        const fimArray = [];
        const suffixArray = [];

        rows.forEach(row => {
            const index = row.fim.indexOf("FIM");
            if (index !== -1) {
                const suffix = row.fim.substring(index);
                if (!suffixArray.includes(suffix)) {
                    suffixArray.push(suffix);
                    fimArray.push({ id: row.id, fim: suffix });
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: 'FIM lists',
            data: fimArray
        })

    } catch (error) {
        return res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
}

// Callable from other controllers: pass { contractNos, contractNo } (same shape as req.query).
// Returns the raw data (throws CustomError on bad input) — no req/res dependency.
exports.getSobWiseContractReport = async ({ contractNos, contractNo }) => {
    // ── Single contract: FIM detail modal (Image 2) ──────────────────────────
    if (contractNo) {
        const [fimRecords] = await connection.execute(`
            SELECT
                DISTINCT
                contractNo,
                fimNo as actualFim,
                SUBSTRING(fimNo, LOCATE('FIM', fimNo)) AS fimNo,
                plannedStatus                           AS status
            FROM sob
            WHERE contractNo = ?
        `, [contractNo]);

        // Build summary counts for the stat cards (P / P/R / P/R/D)
        const summary = { P: 0, 'P/R': 0, 'P/R/D': 0 };
        for (const r of fimRecords) {
            if (summary[r.status] !== undefined) summary[r.status]++;
        }

        // Batch-fetch invoice details in a single query instead of N+1
        if (fimRecords.length > 0) {
            const whereClauses = fimRecords.map(() => '(del.contractNo = ? AND del.fimNo = ?)').join(' OR ');
            const params = fimRecords.flatMap(f => [f.contractNo, f.actualFim]);

            const [invoiceRows] = await connection.execute(`
                SELECT del.contractNo, del.fimNo, gsi.endTime, gst.invNo, gst.invoIssuDate
                FROM del_note del
                LEFT JOIN gstsalesinvoitem gsi ON gsi.delDtlId = del.id
                LEFT JOIN gstsalesinvo gst ON gst.id = gsi.gstsalesinvo_id
                WHERE ${whereClauses}
            `, params);

            // O(1) lookup map keyed by contractNo|fimNo
            const invoiceMap = new Map();
            for (const row of invoiceRows) {
                invoiceMap.set(`${row.contractNo}|${row.fimNo}`, row);
            }

            for (const fim of fimRecords) {
                const inv = invoiceMap.get(`${fim.contractNo}|${fim.actualFim}`);
                fim.invoiceNo = inv?.invNo ?? null;
                fim.invoiceDate = inv?.invoIssuDate ? await formatDate(inv.invoIssuDate) : null;
                fim.dispatchedOn = inv?.endTime ? await formatDate(inv.endTime) : null;
            }
        }

        return {
            message: 'FIM details for contract',
            data: {
                contractNo,
                totalFIM: fimRecords.length,
                summary,
                fimRecords
            }
        };
    }

    // ── Multiple contracts: main contracts table (Image 1) ───────────────────
    if (!contractNos) {
        throw new CustomError('contractNos is required', 400);
    }

    // Support both comma-string ("CN-001,CN-002") and array from query parser
    const contractList = Array.isArray(contractNos)
        ? contractNos
        : contractNos.split(',').map(s => s.trim()).filter(Boolean);

    if (contractList.length === 0) {
        throw new CustomError('contractNos must not be empty', 400);
    }

    const placeholders = contractList.map(() => '?').join(',');

    const [mainRecords] = await connection.execute(`
        SELECT
            contractNo,
            COUNT(DISTINCT fimNo)  AS totalFIM,
            CASE
                WHEN SUM(plannedStatus = 'P/R/D') > 0 THEN 'P/R/D'
                WHEN SUM(plannedStatus = 'P/R')   > 0 THEN 'P/R'
                ELSE 'P'
            END                             AS status
        FROM sob
        WHERE contractNo IN (${placeholders})
        GROUP BY contractNo
    `, contractList);

    return { message: 'SOB contract list', data: mainRecords };
};

exports.sobWiseContractReport = asyncHandler(async (req, res) => {
    const { contractNos, contractNo } = req.query;

    const { message, data } = await exports.getSobWiseContractReport({ contractNos, contractNo });

    return handleSuccessResponse(res, message, data);
});

// Pivoted, one-row-per-contract report for direct tabular/Excel display:
// contractNo, <one column per distinct FIM No, e.g. "FIM11.12"> (each cell = that
// FIM's own status), Status (contract-level worst-case), Invoice No, Invoice Date,
// Dispatched On (latest invoice for the contract).
exports.consolidatedContractReport = asyncHandler(async (req, res) => {
    const { contractNos } = req.query;

    if (!contractNos) {
        throw new CustomError('contractNos is required', 400);
    }

    const contractList = Array.isArray(contractNos)
        ? contractNos
        : contractNos.split(',').map(s => s.trim()).filter(Boolean);

    if (contractList.length === 0) {
        throw new CustomError('contractNos must not be empty', 400);
    }

    const placeholders = contractList.map(() => '?').join(',');

    const [fimRecords] = await connection.execute(`
        SELECT
            DISTINCT
            contractNo,
            fimNo as actualFim,
            SUBSTRING(fimNo, LOCATE('FIM', fimNo)) AS fimNo,
            plannedStatus                           AS status
        FROM sob
        WHERE contractNo IN (${placeholders})
    `, contractList);

    // Batch-fetch invoice details for every contract+FIM in one query — no N+1
    if (fimRecords.length > 0) {
        const whereClauses = fimRecords.map(() => '(del.contractNo = ? AND del.fimNo = ?)').join(' OR ');
        const params = fimRecords.flatMap(f => [f.contractNo, f.actualFim]);

        const [invoiceRows] = await connection.execute(`
            SELECT del.contractNo, del.fimNo, gsi.endTime, gst.invNo, gst.invoIssuDate
            FROM del_note del
            LEFT JOIN gstsalesinvoitem gsi ON gsi.delDtlId = del.id
            LEFT JOIN gstsalesinvo gst ON gst.id = gsi.gstsalesinvo_id
            WHERE ${whereClauses}
        `, params);

        const invoiceMap = new Map();
        for (const row of invoiceRows) {
            invoiceMap.set(`${row.contractNo}|${row.fimNo}`, row);
        }

        for (const fim of fimRecords) {
            const inv = invoiceMap.get(`${fim.contractNo}|${fim.actualFim}`);
            fim.invNo = inv?.invNo ?? null;
            fim.invoIssuDate = inv?.invoIssuDate ?? null; // kept raw for date comparison below
            fim.endTime = inv?.endTime ?? null;           // kept raw for date comparison below
        }
    }

    // Natural sort for "FIM<number>[.<number>]" labels — FIM2.3 < FIM4.4 < FIM11.12,
    // not the lexical order a plain string sort would give.
    const fimSortKey = (label) => {
        const match = String(label).match(/FIM(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : Number.MAX_SAFE_INTEGER;
    };

    const fimColumns = [...new Set(fimRecords.map(f => f.fimNo))]
        .sort((a, b) => fimSortKey(a) - fimSortKey(b));

    // Group per contract: per-FIM statuses + the invoice with the latest invoIssuDate
    const contractMap = new Map();
    for (const fim of fimRecords) {
        if (!contractMap.has(fim.contractNo)) {
            contractMap.set(fim.contractNo, { fimStatuses: {}, statuses: [], latestInvoice: null });
        }

        const entry = contractMap.get(fim.contractNo);
        entry.fimStatuses[fim.fimNo] = fim.status;
        entry.statuses.push(fim.status);

        if (fim.invoIssuDate && (!entry.latestInvoice || new Date(fim.invoIssuDate) > new Date(entry.latestInvoice.invoIssuDate))) {
            entry.latestInvoice = { invNo: fim.invNo, invoIssuDate: fim.invoIssuDate, endTime: fim.endTime };
        }
    }

    const data = await Promise.all(
        [...contractMap.entries()].map(async ([contractNo, entry]) => {
            const status = entry.statuses.includes('P/R/D') ? 'P/R/D'
                : entry.statuses.includes('P/R') ? 'P/R'
                : 'P';

            const row = { contractNo };
            for (const col of fimColumns) {
                row[col] = entry.fimStatuses[col] ?? '';
            }
            row.status = status;
            row.invoiceNo = entry.latestInvoice?.invNo ?? null;
            row.invoiceDate = entry.latestInvoice?.invoIssuDate ? await formatDate(entry.latestInvoice.invoIssuDate) : null;
            row.dispatchedOn = entry.latestInvoice?.endTime ? await formatDate(entry.latestInvoice.endTime) : null;

            return row;
        })
    );

    // Stat-card counts — one contract counted once, by its aggregate status
    const summary = { P: 0, 'P/R': 0, 'P/R/D': 0 };
    for (const row of data) {
        if (summary[row.status] !== undefined) summary[row.status]++;
    }

    return handleSuccessResponse(res, 'Consolidated contract report', { columns: fimColumns, rows: data, summary });
});

exports.searchContractNo = asyncHandler(async (req, res) => {
    const { q } = req.query;

    if (!q || !q.trim()) {
        throw new CustomError('Search query is required', 400);
    }

    const [rows] = await connection.execute(`
        SELECT id, contractNo 
        FROM csl_mst 
        WHERE contractNo LIKE ? 
        LIMIT 20
        ` , [`%${q.trim()}%`]
    );

    return handleSuccessResponse(res, "Contract numbers list", rows);
})