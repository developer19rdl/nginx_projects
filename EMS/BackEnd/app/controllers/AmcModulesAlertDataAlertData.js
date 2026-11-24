

const { connection, CustomError } = require('../config/dbSql2');
const utility = require('../utility/utilityFunction');
const bcrypt = require('bcrypt');

exports.show = async (req, res) => {
    try {
        const showQuery = `SELECT a.id,a.dateTime,a.alertMessage,a.value,m.machine_name from alert_data a 
                        INNER JOIN machines m on m.id=a.machineId                    
        where triggered=1 and isCleared=0`;
        const [rows] = await connection.execute(showQuery);

        if (rows.length > 0) {
            return res.status(200).json({ success: true, data: rows });
        } else {
            return res.status(404).json({ success: false, message: "Data not found" });
        }

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
