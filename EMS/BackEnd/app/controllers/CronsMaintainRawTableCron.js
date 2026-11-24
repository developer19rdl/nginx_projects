const { connection } = require('../config/dbSql2');
const moment = require('moment-timezone');
const cron = require('node-cron');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const tables = [
    'raw_table_1',
    'raw_table_2',
    'raw_table_3',
    'raw_table_4',
    'raw_table_5',
    'raw_table_6',
    'resulttable',
];

// Worker Thread Logic - Call function if in worker thread
if (!isMainThread) {
    (async () => {
        await deleteOldDataFromTable(workerData.tableName);
        process.exit(0); // Graceful exit after execution
    })();
}

async function deleteOldDataFromTable(tableName) {
    const batchSize = 1000;
    let deletedRows = 0;
    const oneHourAgo = moment().tz('Asia/Kolkata').subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss');
    let dbConnection;

    try {
        dbConnection = await connection.getConnection(); // Fetch connection from pool

        while (true) {
            const query = `DELETE FROM ${tableName} WHERE CONCAT(Date, ' ', Time) < ? LIMIT ?`;
            const [result] = await dbConnection.execute(query, [oneHourAgo, batchSize]);
            deletedRows += result.affectedRows;

            if (result.affectedRows < batchSize) break; // Stop if fewer rows deleted than batch size
        }

        console.log(`Deleted ${deletedRows} rows from ${tableName}.`);
        parentPort.postMessage({ tableName, affectedRows: deletedRows });

    } catch (error) {
        parentPort.postMessage({ tableName, error: error.message });
    } finally {
        if (dbConnection) dbConnection.release(); // Release connection
    }
}

const MAX_CONCURRENT_WORKERS = 3;

async function runWorkersInBatches() {
    for (let i = 0; i < tables.length; i += MAX_CONCURRENT_WORKERS) {
        const batch = tables.slice(i, i + MAX_CONCURRENT_WORKERS);

        const workerPromises = batch.map(table => new Promise((resolve, reject) => {
            const worker = new Worker(__filename, { workerData: { tableName: table } });

            worker.on('message', resolve);
            worker.on('error', reject);
            worker.on('exit', (code) => {
                if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
            });
        }));

        await Promise.all(workerPromises);
    }
}

exports.MaintainRawTableCron = async (req, res) => {
    cron.schedule('0 */3 * * *', async () => {
        console.log('Cron job started for deleting old data...');
        await runWorkersInBatches();
        console.log('Cron job completed: Old data deleted successfully.');
        // return res.status(200).json({
        //     success: true,
        //     message: "Cron job completed: Old data deleted successfully.",
        // });
    });
};
