const { connection, CustomError } = require('./config/dbSql2.js');
const utility = require('../utility/utilityFunction');
const bcrypt = require('bcrypt');
const moment = require('moment');
// exports.show = (req, res) => {
//     try {
//         const { filterType, operatorId, id, fromDate, toDate } = req.body;

//         // Input validation
//         if (!filterType || !fromDate || !toDate ||
//             (filterType === 'operator' && !operatorId) ||
//             (filterType === 'machine' && !id)) {
//             return res.status(400).json({ success: false, message: "Missing or invalid parameters" });
//         }

//         let whereClause = '';
//         let queryParams = [];



//         // Execute the query
//         sql.query(fetch, queryParams, (err, results) => {
//             if (err) {
//                 console.error("Error executing SQL query:", err);
//                 return res.status(500).json({ success: false, message: "Internal server error" });
//             }

//             if (results.length === 0) {
//                 return res.status(200).json({
//                     success: true,
//                     message: "No login records found",
//                     data: [] // Empty data array as no results found
//                 });
//             }

exports.show = async (req, res) => {
    try {
        const { filterType, operatorId, id, fromDate, toDate } = req.body;

        if (!filterType || !fromDate || !toDate ||
            (filterType === 'operator' && !operatorId) ||
            (filterType === 'machine' && !id)) {
            return res.status(400).json({ success: false, message: "Missing or invalid parameters" });
        }

        let whereClause = '';
        let queryParams = [];

        if (filterType === 'operator') {
            whereClause = "WHERE o.operatorId = ? AND date(op.Date_time)>= ?  AND date(op.Date_time)<= ?";
            queryParams = [operatorId, fromDate, toDate];
        } else if (filterType === 'machine') {
            whereClause = "WHERE m.id = ? AND date(op.Date_time)>= ?  AND date(op.Date_time)<= ?";
            queryParams = [id, fromDate, toDate];
        } else {
            return res.status(400).json({ success: false, message: "Invalid filter type" });
        }

        const fetch = `
        SELECT
        o.operatorId AS operatorID,
        op.Operator_Name,
        op.Part_Number,
        op.Jobcard_Number,
        op.Shift,
         DATE_FORMAT(op.Date_time, '%Y-%m-%d') AS Date_time,
        op.Machine_Name,
        op.Actual_Quantity,
        op.Produced_Quantity
    FROM
    operator_details AS op
    INNER JOIN
        operator AS o ON op.Operator_Name = o.operatorName
       INNER JOIN
        machines As m ON op.Machine_Name = m.machine_tag
            ${whereClause}
        `;

        const [results] = await connection.execute(fetch, queryParams);

        if (results.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No login records found",
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: "Login list",
            data: results,
        });
    } catch (err) {
        console.error("Error in try-catch block:", err);
        return res.status(500).json({ success: false, message: err.message || "An error occurred" });
    }
};


exports.getDropdownValues = async (req, res) => {
    try {
        const { filterType } = req.body;

        let fetch = '';

        if (filterType === 'operator') {
            fetch = `
                SELECT DISTINCT
                    o.id as Id,
                    o.operatorId as operatorId,
                    o.operatorName as fieldName
                FROM
                    operator as o

            `;
        } else if (filterType === 'machine') {
            fetch = `
                SELECT DISTINCT
                    m.id as Id,
                    m.machine_tag as fieldName
                FROM
                    machines as m

            `;
        } else {
            return res.status(400).json({ success: false, message: "Invalid filter type" });
        }

        const [results] = await connection.execute(fetch, []);

        return res.status(200).json({
            success: true,
            message: "Dropdown values",
            data: results,
        });
    } catch (err) {
        console.error("Error in try-catch block:", err);
        return res.status(400).json({ success: false, message: err.message || "An error occurred" });
    }
};
