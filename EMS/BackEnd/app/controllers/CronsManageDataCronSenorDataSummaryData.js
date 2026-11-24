const cron = require('node-cron');
const { connection } = require('../config/dbSql2');
const moment = require('moment-timezone');
const { Worker } = require('worker_threads');

// Function to run worker threads in parallel
function runWorker(workerData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(__dirname + '/workerSensor.js', { workerData });
        worker.on('message', resolve);
        worker.on('error', reject);
        // worker.on('exit', code => {
        //     if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        // });
        worker.on('exit', code => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
                reject(new Error(`Worker exited with code: ${code}`));
            } else {
                resolve();
            }
        });

    });
}

// Main cron job
exports.SenorDataSummaryData = async (req, res) => {
    cron.schedule('0 */3 * * *', async () => { // Every 3 hours
        console.log("Sensor data summary backup cron job started...");

        const conn = await connection.getConnection();
        const thresholdDate = moment().subtract(40, 'days').format('YYYY-MM-DD'); // 40 days back

        try {
            const [result] = await conn.execute(`
                SELECT MIN(id) AS minId, MAX(id) AS maxId 
                FROM sensor_data 
                WHERE DATE(dateTime) <= ?
            `, [thresholdDate]);

            const { minId, maxId } = result[0];
            if (minId == null || maxId == null) {
                console.log("No data to process.");
                return;
            }

            const batchSize = 1000;
            const ranges = [];

            for (let startId = minId; startId <= maxId; startId += batchSize) {
                ranges.push({ startId, endId: Math.min(startId + batchSize - 1, maxId), thresholdDate });
            }

            const results = await Promise.all(ranges.map(range => runWorker(range)));
            const totalMoved = results.reduce((a, b) => a + b, 0);

            // return res.status(200).json({
            //     message: "Sensor summary backup completed successfully.",
            //     totalRecordsMoved: totalMoved
            // });
        } catch (error) {
            console.error("Error in SensorDataSummary job:", error);
            // return res.status(500).json({
            //     message: "Error occurred during sensor summary backup.",
            //     error: error.message
            // });
        } finally {
            if (conn) conn.release();
        }
    });
};
