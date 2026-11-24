const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');



exports.showDatabydate = async (req, res) => {
    try {
        let { fromDate, toDate } = req.body;

        // If fromDate or toDate is not provided, set them to null
        if (!fromDate) fromDate = null;
        if (!toDate) toDate = null;

        // Get today's date
        const currentDate = new Date().toISOString().split('T')[0];

        // Calculate 10 days from today
        const tenDaysFromNow = new Date();
        tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);
        const tenDaysFromNowStr = tenDaysFromNow.toISOString().split('T')[0];

        let showQuery;
        let values;

        if (fromDate && toDate) {
            // If both fromDate and toDate are provided, filter by the provided date range
            showQuery = `
                SELECT a.*,m.machine_name as Mname
                FROM assettable a
                INNER JOIN machines m on m.id=a.MachineName
                WHERE a.WarStartDate <= ?  
                AND a.WarEndDate >= ?      
                AND a.WarEndDate <= ?      
                AND a.WarStartDate >= ?  
                AND a.WarEndDate <= ?     
            `;
            values = [currentDate, currentDate, tenDaysFromNowStr, fromDate, toDate];
        } else {
            // If either fromDate or toDate is not provided, only consider the current date range
            showQuery = `
                SELECT  a.*,m.machine_name as Mname
                FROM assettable a
                INNER JOIN machines m on m.id=a.MachineName
                WHERE a.WarStartDate <= ? 
                AND a.WarEndDate >= ?     
                AND a.WarEndDate <= ?      
            `;
            values = [currentDate, currentDate, tenDaysFromNowStr];
        }

        const [rows] = await connection.execute(showQuery, values);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }
    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


