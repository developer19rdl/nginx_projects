const { connection, CustomError, handleErrorResponse, handleSuccessResponse } = require('../../config/dbSql');
const excel = require('exceljs');
const { decodeBase64 } = require('../../utility/utilityFunction');

exports.template = async (req, res) => {
    try {
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Add headers
        const headerRow = worksheet.addRow(['Contract Number', 'Part No', 'Qty', 'Description', 'Box No']);

        // Apply styles to the header row
        headerRow.font = { bold: true };  // Make text bold
        headerRow.font = { size: 13 };
        headerRow.alignment = { horizontal: 'center' };  // Center align text

        worksheet.columns.forEach((column) => {
            column.width = 20;
        });

        // Set content type and disposition including desired filename
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename = SOB.xlsx');

        // Write the Excel file to the response
        workbook.xlsx.write(res)
            .then(() => {
                // End the response stream
                res.end();
            })
            .catch(err => {
                console.error('Error writing Excel file:', err);
                res.status(500).send('Error generating Excel file');
            });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message || 'An error occurred' });
    }
};


// SOB extraction for 1 Sheet
exports.import = async (req, res) => {
    let sobMstId;
    let contractNos = []; // Array to store contract numbers

    try {
        const { file, kanbanDate, cell = null } = req.body;

        // Extract base64 data
        const buffer = await decodeBase64(file);

        // Excel Processing
        const workbook = new excel.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1);

        const sheetName = worksheet.name;

        // Data Extraction
        const contents = [];
        const totalRows = worksheet.rowCount;

        // 1. Gather all unique contract numbers from the sheet first
        const contractNosInSheet = [];
        for (let i = 8; i <= totalRows; i++) {
            const row = worksheet.getRow(i);
            const cellValue = row.getCell(1).value;
            if (cellValue === undefined || cellValue === null) {
                break; // Break the loop if an empty row is found
            }
            const contractNo = row.getCell(1).text;
            if (!contractNosInSheet.includes(contractNo)) {
                contractNosInSheet.push(contractNo);
            }
        }

        // 2. Fetch all FIMs in a single query to avoid O(N) db calls inside the loop
        const fimMap = new Map();
        if (contractNosInSheet.length > 0) {
            const placeholders = contractNosInSheet.map(() => '?').join(',');
            const [rows] = await connection.execute(
                `SELECT contractNo, fim FROM csl_mst WHERE contractNo IN (${placeholders})`,
                contractNosInSheet
            );
            rows.forEach(r => fimMap.set(r.contractNo, r.fim));
        }

        for (let i = 8; i <= totalRows; i++) { // Start from row 8
            const row = worksheet.getRow(i);

            if (row.getCell(1).value === undefined || row.getCell(1).value === null) {
                break; // Break the loop if an empty row is found
            }

            const contractNo = row.getCell(1).text;
            const formattedMsd = row.getCell(2).value;

            const fim = fimMap.get(contractNo);
            if (fim === undefined) {
                throw new CustomError(`Contract No not found: ${contractNo}`, 400);
            }

            if (contractNos.includes(contractNo)) {
                throw new CustomError(`duplicate contract no: ${contractNo}`, 400);
            }
            contractNos.push(contractNo);   // Pushing contractNo to the array

            row.eachCell((cell, colNumber) => {
                if (colNumber > 3) {
                    const header = worksheet.getRow(6).getCell(colNumber).text;
                    const subHeader = worksheet.getRow(7).getCell(colNumber).text;
                    const mstFim = fim + header.slice(3);          // Extract characters starting from index 3
                    const cellVal = cell.text;

                    if (cellVal === 'YES' && subHeader === 'MALLIK') {
                        const array = { contractNo: contractNo, fim: header, mstFim: mstFim, msd: formattedMsd, sheetName: sheetName };
                        contents.push(array);
                    }
                }
            });
        };

        // Sob Mst
        sobMstId = await sobMst(kanbanDate, contractNos);
        const cRows = await cslDetail();    // Fetch current CSL

        if (cRows.length > 0) {
            const extractedCont = await index(contents, cRows);     // Extracting Items from csl comparing with sob
            const storeSob = await store(extractedCont, sobMstId, cell) // Storing Sob

            if (storeSob) {
                // Store comma-separated contractNos in the sobMst table
                return res.status(200).json({ success: true, message: 'Successfuly Inserted' });
            }
            throw new CustomError('Something went wrong!', 400);
        } else {
            throw new CustomError('No Csl record found!', 400);
        }
    } catch (err) {
        if (sobMstId) {
            await connection.execute('DELETE FROM sob_mst WHERE id = ?', [sobMstId]);
        }
        return handleErrorResponse(res, err);
    }
};


async function getFIM(contractNo) {
    try {
        if (!contractNo) {
            throw new CustomError('Contract No not be null!', 400);
        }
        const [rows] = await connection.execute(`SELECT fim FROM csl_mst WHERE contractNo = ?`, [contractNo]);

        if (rows.length === 0) throw new CustomError(`Contract No not found: ${contractNo}`, 400);

        return rows[0].fim;
    } catch (err) {
        throw err;
    }

}

//  Fetch Contract No based Items from csl
async function index(sobArray, cslArray) {
    try {
        const matchedArray = [];

        // Pre-index cslArray into a Map for fast lookup - O(N + M) matching complexity
        const cslMap = new Map();
        for (const cslItem of cslArray) {
            const key = `${cslItem.contractNo}_${cslItem.boxNo}`;
            if (!cslMap.has(key)) {
                cslMap.set(key, []);
            }
            cslMap.get(key).push(cslItem);
        }

        for (const sobItem of sobArray) {
            const key = `${sobItem.contractNo}_${sobItem.mstFim}`;
            const matches = cslMap.get(key);
            if (matches) {
                for (const cslItem of matches) {
                    let combinedObject = {
                        ...cslItem,
                        fim: cslItem.boxNo,
                        msd: sobItem.msd,
                        sheetName: sobItem.sheetName,
                    };
                    matchedArray.push(combinedObject);
                }
            }
        }

        return matchedArray;
    } catch (err) {
        throw err;
    }
};

async function store(items, sobMstId, cell) {
    try {
        if (items.length <= 0) {
            throw new CustomError('No Items found in CSL!', 404);
        }
        const insertQuery = `INSERT INTO sob (sobMstId, cslMstId, cslId, contractNo, partNo, Qty, description, fimNo, msd, sheetName, npdCheck, type) VALUES ?`;
        const values = items.map(item => [sobMstId, item.cslMstId, item.id, item.contractNo, item.partNo, item.Qty, item.description, item.boxNo, item.msd, item.sheetName, item.npdCheck, cell]);

        await connection.query(insertQuery, [values]);

        // Check each partNo in items table in bulk to avoid O(N) queries
        const uniquePartNos = [...new Set(items.map(item => item.partNo))];
        const existingSet = new Set();

        if (uniquePartNos.length > 0) {
            const [existingItems] = await connection.query(
                'SELECT itemCode FROM items WHERE itemCode IN (?)',
                [uniquePartNos]
            );
            existingItems.forEach(row => existingSet.add(row.itemCode));
        }

        const missingValues = [];
        for (const item of items) {
            if (!existingSet.has(item.partNo)) {
                missingValues.push([sobMstId, item.cslMstId, item.partNo, item.description, item.Qty, item.fim]);
            }
        }

        if (missingValues.length > 0) {
            const missingCslQuery = 'INSERT INTO missing_csl (sobMstId, cslMstId, itemCode, description, Qty, fim) VALUES ?';
            await connection.query(missingCslQuery, [missingValues]);
        }

        return true;
    } catch (error) {
        throw error;
    }
}

// Fetch current CSL
async function cslDetail() {
    try {
        // const [rows] = await connection.execute(
        //     `SELECT c.* FROM csl c
        //      INNER JOIN csl_mst cm ON c.cslMstId = cm.id
        //      WHERE cm.sobStatus = ?`,
        //     [0]
        // );
        const [rows] = await connection.execute(
            `SELECT 
                c.id, c.cslMstId, c.contractNo, c.partNo, c.Qty, c.boxNo, 
                IF(pf.name = 'NPD', 1, 0) AS npdCheck
            FROM csl c
            JOIN csl_mst cm 
                ON cm.id = c.cslMstId
                AND cm.sobStatus = 0
            LEFT JOIN items i 
                ON i.itemCode = c.partNo
            LEFT JOIN item_product_family pf 
                ON pf.id = i.productFamily`
        );


        if (rows.length === 0) {
            throw new CustomError('No Csl record found!', 400);
        }

        return rows;
    } catch (err) {
        throw err;
    }
}

async function getSobNo() {
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');

        const [fRows] = await connection.execute('SELECT * FROM sob_mst ORDER BY id DESC LIMIT 1', []);
        let intVal = 0;

        if (fRows.length > 0) {
            const string = fRows[0].sobNo;
            intVal = (string == null || string == "") ? 0 : parseInt(string.split('SO')[1], 10);
        }
        const yearMonthString = `${currentYear}${currentMonth}SO${intVal + 1}`;

        return yearMonthString;
    } catch (err) {
        throw err;
    }
}

async function sobMst(kanban, contractNos) {
    try {
        const contractString = contractNos.join(',');
        await connection.execute(`DELETE FROM sob_mst WHERE contractNos IN (?)`, [contractString]);

        const sobNo = await getSobNo();
        const [rows] = await connection.execute('INSERT INTO sob_mst (sobNo, kanbanDate, contractNos) VALUES (?, ?, ?)', [sobNo, kanban, contractString]);

        if (rows.affectedRows > 0) {
            return rows.insertId;
        }

        throw new CustomError('Failed to generate Sob No!', 400);
    } catch (error) {
        throw error;
    }
}

exports.sobExport = async (req, res) => {
    try {
        const sobMstId = req.query.sobMstId;
        const [sRows] = await connection.execute('SELECT COUNT(*) FROM sob_mst WHERE id = ?', [sobMstId]);

        if (sRows.length === 0) throw new CustomError('Sob not found!', 404);

        const [sobRows] = await connection.execute(`SELECT contractNo, null as product, fimNo, DATE_FORMAT(msd, '%d-%m-%Y') AS msd, partNo, Qty FROM sob WHERE sobMstId = ?`, [sobMstId]);

        // Create a new Excel workbook
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Sob lists');

        // Add headers
        const headerRow = worksheet.addRow([
            "Contract No",
            "Product",
            "FIM No",
            "MSD",
            "Part No",
            "Qty",
        ]);

        // Apply styles to the header row
        headerRow.font = { bold: true }; // Make text bold
        headerRow.alignment = { horizontal: "center" }; // Center align text

        worksheet.columns.forEach((column) => {
            column.width = 20;
        });

        // Add data to the worksheet
        sobRows.forEach(row => {
            const rowData = Object.values(row);
            worksheet.addRow(rowData);
        });

        // Convert the workbook to a buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Set response headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename="sob_data.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Send the buffer as a downloadable file
        res.send(buffer);
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
    }
};

exports.productMap = async (req, res) => {
    const conn = await connection.getConnection();
    await conn.beginTransaction();

    try {
        const sobMstId = req.body.sobMstId;
        const file = req.body.file;

        if (!sobMstId || !file) throw new CustomError('Request body cannot be empty!', 400);

        const products = await extractProduct(file);
        const contractNos = products.map(product => product.contractNo);

        if (contractNos.length === 0) {
            throw new CustomError('No contract numbers found in the product file', 400);
        }

        // Generate placeholders for the contractNos
        const placeholders = contractNos.map(() => '?').join(',');

        // Check if all contractNos are in the csl_mst table
        const [rows] = await connection.execute(
            `SELECT contractNo FROM csl_mst WHERE contractNo IN (${placeholders})`,
            contractNos
        );

        const existingContractNos = rows.map(row => row.contractNo);
        const missingContractNos = contractNos.filter(contractNo => !existingContractNos.includes(contractNo));

        if (missingContractNos.length > 0) {
            throw new CustomError(`ContractNo(s) not found: ${missingContractNos.join(', ')}`, 404);
        }

        // Proceed with updates in a transaction for reliability and performance
        if (products.length > 0) {
            const cases = [];
            const caseValues = [];
            const queryContractNos = [];

            for (const p of products) {
                cases.push("WHEN ? THEN ?");
                caseValues.push(p.contractNo, p.product);
                queryContractNos.push(p.contractNo);
            }

            const bulkUpdateQuery = `
                UPDATE csl_mst 
                SET product = CASE contractNo 
                    ${cases.join(' ')} 
                END 
                WHERE contractNo IN (${queryContractNos.map(() => '?').join(',')})
            `;
            await conn.execute(bulkUpdateQuery, [...caseValues, ...queryContractNos]);

            // Mark sobMstId as mapped
            await conn.execute(`UPDATE sob_mst SET mapStatus = 1 WHERE id = ?`, [sobMstId]);

            await conn.commit();
        }

        return handleSuccessResponse(res, "Products mapped successfully");

    } catch (err) {
        await conn.rollback();
        return handleErrorResponse(res, err);
    } finally {
        await conn.release();
    }
}

async function extractProduct(file) {
    try {
        const [mstProducts] = await connection.execute(`SELECT name as productName FROM mst_products WHERE dflag = ?`, [0]);
        const masterProductNames = new Set(mstProducts.map(product => product.productName));

        const buffer = await decodeBase64(file);
        const workbook = new excel.Workbook();

        await workbook.xlsx.load(buffer);
        const worksheet = workbook.getWorksheet(1);

        const products = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip header row
                const contractNo = row.getCell(1).text;
                const product = row.getCell(2).text;

                if (!masterProductNames.has(product)) {
                    throw new CustomError(`Unknown product recieved: ${product}`);
                }
                products.push({ contractNo, product });
            }
        });

        return products;
    } catch (error) {
        throw error;
    }
}

exports.missingCsl = async (req, res) => {
    try {
        const { sobMstId, q } = req.query;

        // Fetch missing CSL entries
        const [rows] = await connection.execute(`SELECT cm.contractNo, ms.itemCode, ms.description, ms.Qty, ms.fim FROM missing_csl ms
                INNER JOIN csl_mst cm ON cm.id = ms.cslMstId
                WHERE sobMstId = ? and dflag = ? and ms.fim LIKE ?`,
            [sobMstId, '0', `%${q}%`]
        );

        // Create a new Excel workbook
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet("Missing_Csl");

        // Add headers
        const headerRow = worksheet.addRow([
            "Contract No",
            "Part No",
            "Description",
            "Qty",
            "FIM"
        ]);

        // Apply styles to the header row
        headerRow.font = { bold: true, size: 13 };
        headerRow.alignment = { horizontal: "center" };

        worksheet.columns.forEach((column, index) => {
            column.width = index === 2 ? 45 : index === 1 ? 30 : 20;
            column.alignment = { horizontal: "center" }; // Center align all columns
        });

        // Add data to the worksheet
        rows.forEach(row => {
            const rowData = Object.values(row);
            worksheet.addRow(rowData);
        });

        // Convert the workbook to a buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Set response headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename="Missing Csl.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        // Send the buffer as a downloadable file
        res.send(buffer);
    } catch (err) {
        return handleErrorResponse(res, err);
    }
}
