const { connection } = require('../config/dbSql2');
const moment = require('moment-timezone');

exports.AllMachineList = async (req, res) => {
    try {

        const [machineResult] = await connection.execute(`
            SELECT m.*, d.departmentName, u.unit
            FROM machines m
            INNER JOIN departments d ON m.department_id = d.id
            INNER JOIN units u ON m.measure_unit_id = u.id
            
       
        `);

        if (machineResult.length === 0) {
            throw new Error("Machine not found");
        }

        res.status(200).json({
            message: " ALl Machine Lists",
            data: machineResult,

        });

    } catch (err) {
        res.status(406).json({
            message: err.message || 'An error occurred',
            status: err.statusCode || 406
        });
    }
};

exports.DashBoardMachineList = async (req, res) => {
    try {
        let pieData = []
        const currentDate = moment().format('YYYY-MM-DD');
        const [machineResult] = await connection.execute(`
            SELECT machines.*, departments.departmentName, units.unit
            FROM machines
            INNER JOIN departments ON machines.department_id = departments.id
            INNER JOIN units ON machines.measure_unit_id = units.id
            WHERE machines.is_dashboard_display = 'true'
        `);

        if (machineResult.length === 0) {
            throw new Error("Machine not found");
        }

        for (const data of machineResult) {

            


            const [plannedResult] = await connection.execute(`
                SELECT planned
                FROM oee_shift_data_view
                WHERE machineId = ? AND DATE(date) = ?
                ORDER BY id desc LIMIT 1
            `, [data.id, currentDate]);


            data.planned = plannedResult.length > 0 ? plannedResult[0].planned : null;

            const [productionData] = await connection.execute(`
                SELECT value
                FROM production_data
                WHERE machineId = ? AND DATE(date) = ?
            `, [data.id, currentDate]);

            let totalValue = 0;
            for (const production of productionData) {
                totalValue += production.value;
            }
            data.actualShift = totalValue;


            const [oeeShiftDataResults] = await connection.execute(`
                SELECT actual,planned,capacity,availability,quality,performance,oee,availableTime,downTime,uptime,idleTime
                FROM oee_shift_data_view
                WHERE machineId = ? 
                ORDER BY id DESC
            `, [data.id]);

            data.actual = oeeShiftDataResults.length > 0 ? oeeShiftDataResults[0].actual : 0;
            // data.plannedShiftProduction = oeeShiftDataResults.length > 0 ? oeeShiftDataResults[0].actual : null;
            // data.capacity = oeeShiftDataResults.length > 0 ? oeeShiftDataResults[0].capacity : null;
            data.availability = oeeShiftDataResults.length > 0 ? oeeShiftDataResults[0].availability : 0;
            data.quality = oeeShiftDataResults.length > 0 ? oeeShiftDataResults[0].quality : 0;
            data.performance = oeeShiftDataResults.length > 0 ? oeeShiftDataResults[0].performance : 0;
            data.oee = oeeShiftDataResults.length > 0 ? oeeShiftDataResults[0].oee : 0;
            data.availableTime = oeeShiftDataResults.length > 0 ? oeeShiftDataResults[0].availableTime : 0;
            data.downTime = oeeShiftDataResults.length > 0 ? oeeShiftDataResults[0].downTime : 0;
            data.uptime = oeeShiftDataResults.length > 0 ? oeeShiftDataResults[0].uptime : 0;
            data.idleTime = oeeShiftDataResults.length > 0 ? oeeShiftDataResults[0].idleTime : 0;
            let pieData = [];
            pieData[0] = ["Task", "Hours per Day"];
            pieData[1] = ["Planned", data.availableTime]
            pieData[2] = ["Unplanned", data.downTime]
            pieData[3] = ["Uptime", data.uptime]
            pieData[4] = ["Idletime", data.idleTime]

            data.pieData = pieData;


            let utilizationData = [];
            utilizationData[0] = ["Task", "Hours per Day"];
            utilizationData[1] = ["Planned", data.availableTime]
            utilizationData[2] = ["Unplanned", data.downTime]
            utilizationData[3] = ["Uptime", data.uptime]
            utilizationData[4] = ["Idletime", data.idleTime]

            data.utilizationData = utilizationData;
        }


        res.status(200).json({
            message: "Machine Lists",
            data: machineResult,



        });

    } catch (err) {
        res.status(406).json({
            message: err.message || 'An error occurred',
            status: err.statusCode || 406
        });
    }
};




exports.machineHealthList = async (req, res) => {
    try {
        const [machineResult] = await connection.execute(`
            SELECT machine_name AS machineName, id, machineImage
            FROM machines
            WHERE machines.isSensorHealth = 1
        `);

        if (machineResult.length === 0) {
            return res.status(404).json({
                message: "No machines found with sensor health enabled",
            });
        }

        const alertCount = async (machineId) => {
            const query = `
                SELECT *
                FROM alert_data 
                WHERE triggered = 1 AND isCleared = 0 AND machineId = ?;
            `;
            const [result] = await connection.execute(query, [machineId]);


            return result.length > 0 ? result.length : 0;
        };

        const updatedMachines = await Promise.all(machineResult.map(async (item) => {
            const machineId = item.id;
            const alertsCount = await alertCount(machineId);
            // Replace with actual logic to determine machineHealthStatus if available
            const machineHealthStatus = 54;
            return { ...item, alertsCount, machineHealthStatus };
        }));

        res.status(200).json({
            message: "Machine Health List",
            data: updatedMachines
        });

    } catch (err) {
        res.status(500).json({
            message: err.message || 'An error occurred while fetching machine health data',
        });
    }
};




exports.clear = async (req, res) => {
    try {
        const { id } = req.params;
        const { remark } = req.body;
        await connection.execute(`UPDATE alert_data SET remark = ?, triggered = ?,isCleared = ? , WHERE id = ?`, [remark, 0, 1, id]);
        res.status(200).json({ success: true, message: 'Alert cleared successfully' });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ success: false, message: 'An error occurred', error: err.message });
    }
}
