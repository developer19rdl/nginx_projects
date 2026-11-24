// const sql = require('../config/dbSql.js');
const { connection, CustomError } = require('../config/dbSql2.js');
const utility = require('../utility/utilityFunction');
const bcrypt = require('bcrypt');

exports.store = async (req, res) => {
    try {
        const user = req.body;

        // Check if any required field is missing
        const requiredFields = ['empname', 'password', 'departmentName', 'email', 'phoneNo', 'userRole', 'userName'];
        for (const field of requiredFields) {
            if (!(field in user)) {
                return res.status(400).json({ success: false, message: `${field} is required` });
            }
        }
        const [empidRows, empidFields] = await connection.execute(`SELECT * FROM user WHERE empid = ?`, [user.empid]);
        if (empidRows.length > 0) {
            return res.status(400).json({ success: false, message: "Employee Id already exists!" });
        }

        // Check if the userCode already exists
        const [empnameRows, empnameFields] = await connection.execute(`SELECT * FROM user WHERE empname = ?`, [user.empname]);
        if (empnameRows.length > 0) {
            return res.status(400).json({ success: false, message: "Employee Name already exists!" });
        }

        // Trim any extra spaces from email
        const email = user.email.trim();
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // Generate unique employee ID
        const empid = await generateUniqueEmpId();

        const hashedPassword = await bcrypt.hash(user.password, 10);
        const storeQuery = 'INSERT INTO user (empid, empname, password, departmentName, email, phoneNo, userRole, userName) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [empid, user.empname, hashedPassword, user.departmentName, email, user.phoneNo, user.userRole, user.userName];
        const [sRows] = await connection.execute(storeQuery, values);
        if (sRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "User added successfully" });
        } else {
            throw new CustomError("Failed to add user");
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
async function generateUniqueEmpId() {
    try {
        // Find the maximum numeric part of the existing employee IDs from the database
        const [rows] = await connection.execute('SELECT empid FROM user');

        let maxNumericPart = 0;

        if (rows.length > 0) {
            rows.forEach(row => {
                const numericPart = parseInt(row.empid.replace('emp', ''), 10);
                if (numericPart > maxNumericPart) {
                    maxNumericPart = numericPart;
                }
            });
        }

        // Increment the maximum numeric part to generate the new employee ID
        const newNumericPart = maxNumericPart + 1;

        // Format the new employee ID
        const newEmpId = 'emp' + ('0' + newNumericPart).slice(-2);

        return newEmpId;
    } catch (err) {
        throw err;
    }
};

exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const user = req.body;
        const [fRows] = await connection.execute(`SELECT * FROM user WHERE id = ?`, [id]);
        if (fRows.length == 0) {
            throw new CustomError("User not found!", 404);
        }
        // const hashedPassword = user.password ? await bcrypt.hash(user.password, 10) : null;
        let updateQuery = `UPDATE user SET empname = ?, departmentName = ?, userRole = ?, userName = ?, email = ? ,phoneNo = ?`;
        const values = [user.empname, user.departmentName, user.userRole, user.userName, user.email, user.phoneNo];
        // if (hashedPassword) {
        //     updateQuery += `, password = ?`;
        //     values.push(hashedPassword);
        // }
        updateQuery += ` WHERE id = ?`;
        values.push(id);
        const [uRows] = await connection.execute(updateQuery, values);
        if (uRows.affectedRows > 0) {
            return res.status(200).json({ success: true, message: "Successfully updated" });
        } else {
            throw new CustomError("Failed to update user");
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
exports.delete = async (req, res) => {
    try {
        const id = req.params.id;
        const [fRows] = await connection.execute(`SELECT * FROM user WHERE id = ?`, [id]);
        if (fRows.length == 0) {
            throw new CustomError("User not found!", 404);
        }
        const [DRows] = await connection.execute(`DELETE from user WHERE id = ?`, [id]);
        return res.status(200).json({ success: true, message: "Successfully deleted" });
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



exports.show = async (req, res) => {
    try {
        const showQuery = `SELECT 
         u.id,
         u.empid,
         u.empname,
         u.departmentName,
         u.userRole,
         u.email,
         u.phoneNo,
         u.userName,
         d.departmentName
        FROM 
        user as u
        INNER JOIN 
        departments as d ON u.departmentName  = d.id`;
        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, message: "User list", data: rows });
        } else {
            return res.status(404).json({ success: false, message: "User not found", data: [] });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};



//         sql.query(fetch, (err, results) => {
//             if (err)
//                 return res.status(400).json({ success: false, message: err.message });
