const { parentPort, workerData } = require('worker_threads');
const { connection } = require('../config/dbSql2');

(async () => {
    const { startId, endId, previous2MonthEnd } = workerData;
    let totalMoved = 0;
    const conn = await connection.getConnection();

    try {
        await conn.beginTransaction(); // Start transaction

        // Step 1: Aggregate kWh and get the last kWh_pre for each date
        const [rows] = await conn.execute(`
            SELECT 
                date, 
                meterId, 
                machineId, 
                SUM(kWh) AS total_kWh, 
                MAX(HR) AS last_HR, 
                COALESCE((SELECT kWh_pre FROM energy_data ed 
                WHERE ed.date = e.date AND ed.meterId = e.meterId 
                ORDER BY HR DESC LIMIT 1), 0) AS last_kWh_pre
                    FROM energy_data e
                    WHERE id BETWEEN ? AND ? AND date <= ?
                    GROUP BY date, meterId, machineId
        `, [startId, endId, previous2MonthEnd]);


        rows.forEach((row, index) => {
            if (Object.values(row).includes(undefined)) {
                console.error(`Row ${index} contains undefined values:`, row);
            }
        });

        if (rows.length > 0) {
            const values = rows.map(row => [
                row.machineId || null,
                row.meterId || null,
                row.date || null,
                row.last_HR || null,
                row.total_kWh || 0,
                row.last_kWh_pre || 0
            ]);

            if (values.some(v => v.includes(null) || v.includes(undefined))) {
                console.error("Warning: Some rows contain null or undefined values.", values);
            }

            await conn.query(`
                INSERT INTO energy_summary_data (machineId, meterId, date, HR, kWh, kWh_pre)
                VALUES ?
            `, [values]);

            const deleteQueries = rows.map(async (row) => {
                try {
                    if (row.date) {
                        if (row.meterId !== null) {
                            await conn.query(`
                                DELETE FROM energy_data 
                                WHERE meterId = ? AND date = ?
                            `, [row.meterId, row.date]);
                        } else {
                            await conn.query(`
                                DELETE FROM energy_data 
                                WHERE meterId IS NULL AND date = ?
                            `, [row.date]);
                        }
                    } else {
                        console.warn(`Skipping DELETE due to missing date for row:`, row);
                    }
                } catch (err) {
                    console.error(`Error deleting row with meterId=${row.meterId}, date=${row.date}:`, err);
                }
            });

            await Promise.all(deleteQueries); // Run all deletions in parallel
            totalMoved = rows.length;
        }

        await conn.commit(); // Commit transaction
    } catch (error) {
        await conn.rollback(); // Rollback on error
        console.error(`Worker error in range ${startId}-${endId}:`, error);
    } finally {
        if (conn) conn.release();
    }

    parentPort.postMessage(totalMoved); // Send result back to main thread
})();
