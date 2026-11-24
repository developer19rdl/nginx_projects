const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');





exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const newData = req.body;

        const updateQuery = `
            UPDATE maintcescedue2 
            SET 
            planed = ?,
            Reason = ?
            WHERE 
                id = ?
        `;
        const values = [
            newData.Approve,
            newData.reason,
            id
        ];

        const [result] = await connection.execute(updateQuery, values);

        if (result.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Data updated successfully" });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.show = async (req, res) => {
    try {
        const viewQuery = `SELECT m.*,p.Category_name,n.Nature_problem,ma.machine_name as machineName FROM maintcescedue2 m 
                           INNER JOIN problem_category p on p.id=m.probcate     
                           INNER JOIN nature_problem n on n.id=m.naturecate   
                           INNER JOIN machines ma on ma.id=m.machine              
        where planed=1`;
        const [rows] = await connection.execute(viewQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


exports.showbyid = async (req, res) => {
    try {
        const { id } = req.params;
        const viewQuery = `SELECT * FROM maintcescedue2 where id=?`;
        const [rows] = await connection.execute(viewQuery, [id]);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.storeandupdate = async (req, res) => {
    try {
        const c = req.body;
        // If section does not exist, insert the new record
        const storeQuery = `INSERT INTO update_maintainapprov (cause, correction, corrective_action,mainscheduleid)
     VALUES (?, ?, ?,?)`;
        const values = [c.cause, c.correction, c.corrective_action, c.id];
        const updateValues = [c.id];    
        const updateQuery = `
        UPDATE maintcescedue2
        SET planed = 3
        WHERE id = ?
    `;
        const [sRows] = await connection.execute(storeQuery, values);
        if (sRows.affectedRows > 0) {
            const [uRows] = await connection.execute(updateQuery, updateValues);
            if (uRows.affectedRows > 0) {
                return res.status(200).json({ success: true, message: "Data added and updated successfully" });
            } else {
                throw new Error("Failed to update maintcescedue2 table");
            }
        } else {
            throw new Error("Something went wrong!");
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.showcomp = async (req, res) => {
    try {
        const viewQuery = `SELECT m.*,p.Category_name,n.Nature_problem,ma.machine_name as machineName  FROM maintcescedue2 m
        INNER JOIN problem_category p on p.id=m.probcate
        INNER JOIN nature_problem n on n.id=m.naturecate
        INNER JOIN machines ma on ma.id=m.machine   where planed=3`;
        const [rows] = await connection.execute(viewQuery);
        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

exports.showpending = async (req, res) => {
    try {
        // Query to get pending maintenance data
        const viewQuery = `SELECT m.*,p.Category_name,n.Nature_problem FROM maintcescedue2 m 
        INNER JOIN problem_category p on p.id=m.probcate     
        INNER JOIN nature_problem n on n.id=m.naturecate 
        WHERE planed = 0`;
        const [rows] = await connection.execute(viewQuery);

        if (rows.length > 0) {
            // Initialize an array to hold the results with AMC and Warranty status
            const result = [];

            // Loop through each row to get AMC and Warranty status
            for (const row of rows) {
                const amcQuery = `SELECT COUNT(*) as total FROM amctable where AssetName =?`;
                const warrantyQuery = `SELECT COUNT(*) as total, WarType FROM assettable where  id =?`;

                const [amcRows] = await connection.execute(amcQuery, [row.machine]);
                const [warrantyRows] = await connection.execute(warrantyQuery, [row.machine]);

                let amcStatus, warrantyStatus, warrantyType;

                if (amcRows.length > 0) {
                    const amcCount = amcRows[0].total;
                    amcStatus = amcCount > 0 ? 'AMC Available' : 'No AMC Available';
                } else {
                    amcStatus = 'No AMC Available';
                }

                if (warrantyRows.length > 0) {
                    warrantyStatus = warrantyRows.find(r => r.WarType === 1) ? 'Warranty Available' : 'No Warranty Available';
                } else {
                    warrantyStatus = 'No Warranty Available';
                }

                warrantyType = warrantyStatus === 'Warranty Available' ? 'Yes' : 'Na';

                // Add the status data to the row
                result.push({
                    ...row,
                    AMCStatus: amcStatus,
                    WarrantyStatus: warrantyStatus,
                    WarrantyType: warrantyType
                });
            }

            return res.status(200).json({ success: true, data: result });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


// exports.showpending = async (req, res) => {
//     try {
//         const viewQuery = `SELECT m.* FROM maintcescedue2 m where planed=0`;
//         const [rows] = await connection.execute(viewQuery);

//         if (rows.length > 0) {
//             return res.status(200).json({ success: true, data: rows });
//         } else {
//             return res.status(404).json({ success: false, message: "Data not found" });
//         }

//     } catch (err) {
//         return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
//     }
// };


exports.showreject = async (req, res) => {
    try {
        const viewQuery = `SELECT m.*,p.Category_name,n.Nature_problem FROM maintcescedue2 m
        INNER JOIN problem_category p on p.id=m.probcate     
        INNER JOIN nature_problem n on n.id=m.naturecate where planed=2`;
        const [rows] = await connection.execute(viewQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};




// exports.updateaprove = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const newData = req.body;


//         const [result] = await connection.execute(updateQuery, values);

//         if (result.affectedRows > 0) {
//             return res.status(200).json({ success: true, message: "Data updated successfully" });
//         } else {
//             return res.status(404).json({ success: false, message: "Data not found" });
//         }

//     } catch (err) {
//         return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
//     }
// };
