const cron = require('node-cron');
const { connection } = require('../config/dbSql2');
const moment = require('moment-timezone');
const { Worker } = require('worker_threads');

// Function to run worker threads in parallel
function runWorker(workerData) {
    return new Promise((resolve, reject) => {
        // const worker = new Worker('./worker.js', { workerData });
        const worker = new Worker(__dirname + '/worker.js', { workerData });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', code => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}

// Main cron job
exports.EnergySummaryBackupDataCron = async (req, res) => {
    cron.schedule('0 0 1 */2 *', async () => {
        console.log("Energy summary backup cron job started...");

        // const conn = await connection();
        const conn = await connection.getConnection();

        const previous2MonthEnd = moment().subtract(2, 'month').endOf('month').format('YYYY-MM-DD');

        try {
            // Step 1: Determine range of IDs to process
            const [result] = await conn.execute(`
            SELECT MIN(id) AS minId, MAX(id) AS maxId 
            FROM energy_data 
            WHERE date <= ?
        `, [previous2MonthEnd]);

            const { minId, maxId } = result[0];

            const batchSize = 1000;
            const ranges = [];

            // Step 2: Create ID ranges for parallel processing
            for (let startId = minId; startId <= maxId; startId += batchSize) {
                ranges.push({ startId, endId: Math.min(startId + batchSize - 1, maxId), previous2MonthEnd });
            }

            // Step 3: Process ranges in parallel using workers
            const results = await Promise.all(ranges.map(range => runWorker(range)));
            const totalMoved = results.reduce((a, b) => a + b, 0);

            console.log(`All batches processed successfully: ${totalMoved} records moved.`);
            return true
            // return res.status(200).json({
            //     message: "Energy summary backup completed successfully.",
            //     totalRecordsMoved: totalMoved
            // });
        } catch (error) {
            console.error("Error in EnergySummaryBackup job:", error);
            return true
            // return res.status(500).json({
            //     message: "Error occurred during energy summary backup.",
            //     error: error.message
            // });
        } finally {
            if (conn) conn.release();
        }
    });
};
