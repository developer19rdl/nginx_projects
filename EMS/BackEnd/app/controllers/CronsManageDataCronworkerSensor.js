const { parentPort, workerData } = require('worker_threads');
const { connection } = require('../config/dbSql2');


(async () => {
    const { startId, endId, thresholdDate } = workerData;
    let totalMoved = 0;
    const connSen = await connection.getConnection();

    try {
        await connSen.beginTransaction(); // Start transaction

        const [aggregatedRows] = await connSen.execute(`
            SELECT 
                machineId, 
                deviceId, 
                slaveId, 
                Tag_Id, 
                Tag_Name,
                DATE_FORMAT(dateTime, '%Y-%m-%d %H:00:00') AS hourInterval,
                COALESCE(MIN(CAST(\`Min\` AS DECIMAL(10,2))), 0) AS \`minValue\`,
                COALESCE(MAX(CAST(\`Max\` AS DECIMAL(10,2))), 0) AS \`maxValue\`,
                COALESCE(AVG(CAST(\`Avg\` AS DECIMAL(10,2))), 0) AS \`avgValue\`
            FROM 
                sensor_data
            WHERE 
                id BETWEEN ? AND ? 
                AND DATE(dateTime) <= ?
            GROUP BY 
                machineId, 
                deviceId, 
                slaveId, 
                Tag_Id, 
                Tag_Name, 
                hourInterval;
        `
            , [startId, endId, thresholdDate]);




        if (aggregatedRows.length > 0) {
            // Step 2: Insert aggregated data into sensor_summary_data
            const values = aggregatedRows.map(row => [
                row.machineId, row.deviceId, row.slaveId, row.Tag_Id, row.Tag_Name,
                row.hourInterval, row.minValue, row.maxValue, row.avgValue, 0 // isAggregate = 0
            ]);

            await connSen.query(`
                INSERT INTO sensor_summary_data
                (machineId, deviceId, slaveId, Tag_Id, Tag_Name, dateTime, Min, Max, Avg, isAggregate)
                VALUES ?`
                , [values]);

            totalMoved = aggregatedRows.length;

            // Step 3: Delete old data within the specified range
            await connSen.query(`
                DELETE FROM sensor_data 
                WHERE id BETWEEN ? AND ? AND DATE(dateTime) <= ?`
                , [startId, endId, thresholdDate]);

        }

        await connSen.commit(); // Commit transaction
    } catch (error) {
        await connSen.rollback(); // Rollback on error
        // console.error(`Worker error in range ${startId} - ${endId}:, error1`);
        console.error(`Worker error in range ${startId} - ${endId}: ${error.message}`, error);

    } finally {
        if (connSen) connSen.release();
    }

    parentPort.postMessage(totalMoved); // Send result back to main thread
})();