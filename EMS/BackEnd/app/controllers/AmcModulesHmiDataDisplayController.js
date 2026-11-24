const { connection, CustomError } = require('./config/dbSql2');
const moment = require('moment-timezone');



async function getShiftNumber() {
    try {
        // Define shift timings
        const shifts = [
            { start: '06:00:00', end: '14:00:00', shfNo: 'Shift 1' }, // Shift 1
            { start: '14:00:00', end: '22:00:00', shfNo: 'Shift 2' }, // Shift 2
            { start: '22:00:00', end: '06:00:00', shfNo: 'Shift 3' },  // Shift 3
            { start: '08:00:00', end: '17:00:00', shfNo: 'General Shift' },  // General Shift
            { start: '06:00:00', end: '05:59:00', shfNo: '3 SHIFT' }  // 3 Shift
        ];

        const currentTime = moment.tz('Asia/Kolkata').format('HH:mm:ss');
        const currentDate = moment.tz('Asia/Kolkata').format('YYYY-MM-DD');
        let currentShiftData = null;
        let shiftNumber = null;
        let isNextDay = false;

        for (const shift of shifts) {
            const startTime = moment(shift.start, 'HH:mm:ss');
            const endTime = moment(shift.end, 'HH:mm:ss');

            if (startTime.isBefore(endTime)) {
                // If the shift doesn't cross midnight
                if (moment(currentTime, 'HH:mm:ss').isBetween(startTime, endTime, null, '[)')) {
                    currentShiftData = shift;
                    shiftNumber = shift.shfNo;
                    break;
                }
            } else {
                // If the shift crosses midnight
                if (moment(currentTime, 'HH:mm:ss').isBetween(startTime, moment('23:59:59', 'HH:mm:ss'), null, '[)') ||
                    moment(currentTime, 'HH:mm:ss').isBetween(moment('00:00:00', 'HH:mm:ss'), endTime, null, '[)')) {
                    currentShiftData = shift;
                    shiftNumber = shift.shfNo;
                    isNextDay = moment(currentTime, 'HH:mm:ss').isBefore(startTime);
                    break;
                }
            }
        }

        return { shiftNumber, currentShiftData, currentDate, isNextDay };

    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}


exports.HmiDataDisplay = async (req, res) => {
    try {
        const { machineId, deviceId, slaveId } = req.body;

        const [machineResult] = await connection.execute(`
            SELECT machine_Name ,max_capacity
            FROM machines
            WHERE id = ? 
        `, [machineId]);
        // const machineName = machineResult[0].machine_Name;
        const { machine_Name: machineName, max_capacity: capacity } = machineResult[0];




        const [meterResult] = await connection.execute(`
            SELECT id AS meterId, last_kwh
            FROM meters
            WHERE deviceId = ? AND slaveId = ? 
        `, [deviceId, slaveId]);

        if (meterResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Meter not found"
            });
        }
        const meterId = meterResult[0].meterId;
        const lastKwh = meterResult[0].last_kwh;

        // Fetch energy data using meterId
        const [energyDataResult] = await connection.execute(`
            SELECT  kWh_pre, kW, pF
            FROM energy_data
            WHERE meterId = ? ORDER BY ID DESC
        `, [meterId]);

        const { kW, pF } = energyDataResult[0];

        const { shiftNumber, currentShiftData, currentDate, isNextDay } = await getShiftNumber();


        const [shiftProdPlanResult] = await connection.execute(`
        SELECT plannedCapacity
        FROM shift_production_planning
        WHERE machineId = ? AND scheduleDate = ? AND shiftNumber = ? 
    `, [machineId, currentDate, shiftNumber]);

        // const { plannedCapacity: plannedCapacity } = shiftProdPlanResult[0];
        const plannedCapacity = shiftProdPlanResult.length > 0 ? shiftProdPlanResult[0].plannedCapacity : capacity;


        // Production Calculation
        const [productionInfoResult] = await connection.execute(`
            SELECT id, machineId, deviceId, isProdCapacity, Tag_Id, Tag_Name
            FROM machine_parameter_allocation
            WHERE machineId = ? AND isProdCapacity = ?;
        `, [machineId, 1]);

        // Assuming maximum 2 tags as stated
        const tagId1 = productionInfoResult[0].Tag_Id;
        const tagName1 = productionInfoResult[0].Tag_Name;
        const tagId2 = productionInfoResult.length > 1 ? productionInfoResult[1].Tag_Id : null;
        const tagName2 = productionInfoResult.length > 1 ? productionInfoResult[1].Tag_Name : null;

        let shiftCountTag1 = 0;
        let shiftCountTag2 = 0;
        let generalCountTag1 = 0;
        let generalCountTag2 = 0;

        if (currentShiftData) {
            const shiftEndDate = isNextDay ? moment(currentDate).add(1, 'day').format('YYYY-MM-DD') : currentDate;

            const [prodCountResult1] = await connection.execute(`
                SELECT value
                FROM production_data
                WHERE Tag_Id = ?
                AND machineId = ?
                AND dateTime >= ?
                AND dateTime < ?
            `, [tagId1, machineId, `${currentDate} ${currentShiftData.start}`, `${shiftEndDate} ${currentShiftData.end}`]);

            prodCountResult1.forEach(data => {
                shiftCountTag1 += data.value;
            });

            if (tagId2) {
                const [prodCountResult2] = await connection.execute(`
                    SELECT value
                    FROM production_data
                    WHERE Tag_Id = ?
                    AND machineId = ?
                    AND dateTime >= ?
                    AND dateTime < ?
                `, [tagId2, machineId, `${currentDate} ${currentShiftData.start}`, `${shiftEndDate} ${currentShiftData.end}`]);

                prodCountResult2.forEach(data => {
                    shiftCountTag2 += data.value;
                });
            }
        }

        // General shift calculation
        const generalShift = { start: '08:00:00', end: '17:00:00' };

        const [generalCountResult1] = await connection.execute(`
            SELECT value
            FROM production_data
            WHERE Tag_Id = ?
            AND machineId = ?
            AND dateTime >= ?
            AND dateTime < ?
        `, [tagId1, machineId, `${currentDate} ${generalShift.start}`, `${currentDate} ${generalShift.end}`]);

        generalCountResult1.forEach(data => {
            generalCountTag1 += data.value;
        });

        if (tagId2) {
            const [generalCountResult2] = await connection.execute(`
                SELECT value
                FROM production_data
                WHERE Tag_Id = ?
                AND machineId = ?
                AND dateTime >= ?
                AND dateTime < ?
            `, [tagId2, machineId, `${currentDate} ${generalShift.start}`, `${currentDate} ${generalShift.end}`]);

            generalCountResult2.forEach(data => {
                generalCountTag2 += data.value;
            });
        }

        return res.status(200).json({
            success: true,
            message: "HMI DATA",
            machineName,
            data: {
                kWh: lastKwh,
                kW: parseFloat(kW).toFixed(2),
                pF: pF,
                shiftNumber: shiftNumber,
                shiftCountTag1: shiftCountTag1,
                shiftCountTag2: shiftCountTag2,
                tagName1: tagName1,
                tagName2: tagName2,
                generalCountTag1: generalCountTag1,
                generalCountTag2: generalCountTag2,
                capacity: capacity,
                plannedCapacity: plannedCapacity
            }
        });

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};
