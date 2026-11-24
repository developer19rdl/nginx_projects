const { connection } = require('../config/dbSql2');
const moment = require('moment-timezone');
const cron = require('node-cron');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// Array of table names
const tables = [
    'raw_table_1',
    'raw_table_2',
    'raw_table_3',
    'raw_table_4',
    'raw_table_5',
    'raw_table_6',
    'resulttable',
];

// Function to delete data older than one hour in batches
async function deleteOldDataFromTable(tableName) {
    const batchSize = 1000; // Define the batch size (number of rows to delete at once)
    let deletedRows = 0;
    try {
        const oneHourAgo = moment().tz('Asia/Kolkata').subtract(1, 'hours').format('YYYY-MM-DD HH:mm:ss');

        while (true) {
            // Delete data in batches using LIMIT to optimize performance
            const query = `DELETE FROM ${tableName} WHERE CONCAT(Date, ' ', Time) < ? LIMIT ?`;
            const [result] = await connection.execute(query, [oneHourAgo, batchSize]);

            deletedRows += result.affectedRows;

            if (result.affectedRows < batchSize) {
                // Exit loop if fewer rows are deleted than batch size (no more old data)
                break;
            }
        }
        console.log("deletedRows", deletedRows);
        parentPort.postMessage({ tableName, affectedRows: deletedRows });
    } catch (error) {
        parentPort.postMessage({ tableName, error: error.message });
    }
}

// Worker logic
if (!isMainThread) {
    deleteOldDataFromTable(workerData.tableName);
}

if (isMainThread) {
    exports.MaintainRawTableCronOld = async (req, res) => {
        cron.schedule('0 */3 * * *', async () => { // Every 3 hours
            console.log('Cron job started for deleting old data...');

            const workerPromises = tables.map(table => {
                return new Promise((resolve, reject) => {
                    const worker = new Worker(__filename, { workerData: { tableName: table } });
                    worker.on('message', (msg) => {
                        if (msg.error) {
                            console.error(`Error deleting data from ${msg.tableName}:`, msg.error);
                            reject(msg.error);
                        } else {
                            console.log(`Deleted ${msg.affectedRows} rows from ${msg.tableName}.`);
                            resolve();
                        }
                    });
                    worker.on('error', reject);
                    worker.on('exit', (code) => {
                        if (code !== 0) {
                            reject(new Error(`Worker stopped with exit code ${code}`));
                        }
                    });
                });
            });

            try {
                await Promise.all(workerPromises);

                return true
                // return res.status(200).json({
                //     success: true,
                //     message: "Cron job completed: Old data deleted successfully.",
                // });
                // console.log('Cron job completed: Old data deleted successfully.');
            } catch (error) {
                console.error('Error during cron job execution:', error.message);
                return true
                // return res.status(500).json({
                //     success: false,
                //     message: "Sensors aggregation failed",
                //     error: err.message,
                // });
            }
        });
    };
}
