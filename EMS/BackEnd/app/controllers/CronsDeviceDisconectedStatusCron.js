
const { connection, CustomError } = require('../config/dbSql2');
const cron = require('node-cron');
const moment = require('moment-timezone');

exports.DeviceDisconectedStatusCron = async (req, res) => {
    cron.schedule('*/5 * * * *', async () => {
        const startTime = process.hrtime(); // Start timer

        const now = moment().utcOffset('+05:30'); // Assuming Asia/Kolkata timezone
        const fiveMinutesAgo = now.clone().subtract(5, 'minutes');
        const date = fiveMinutesAgo.format('YYYY-MM-DD');
        const time = fiveMinutesAgo.format('HH:mm:ss');

        try {
            // Fetch all devices and their corresponding raw table IDs in one query
            const [devices] = await connection.execute(`
            SELECT id, edgeDeviceName, deviceTag
            FROM edge_devices
        `);

            if (devices.length === 0) {
                console.log("No devices found.");
                return res.status(200).json({
                    success: true,
                    message: "No devices found"
                });
            }

            const rawTables = {
                1: [9, 20, 23],
                2: [10, 11, 12, 13],
                3: [1, 2, 14, 15],
                4: [4, 8, 19, 25],
                5: [5, 6, 7, 16],
                6: [3, 17, 21, 22, 24]
            };

            // Create a list of device IDs and asset IDs to check in one query
            const devicesToUpdate = devices.map(device => {
                const rawTableId = device.id;
                const tableNo = Object.keys(rawTables).find(key => rawTables[key].includes(rawTableId));
                const assetIds = rawTables[tableNo];
                return { ...device, tableNo, assetIds };
            }).filter(device => device.assetIds);

            // Use a single query to fetch all relevant data for devices
            const deviceQueries = devicesToUpdate.map(device => `
            SELECT * FROM raw_table_${device.tableNo} 
            WHERE AssetId IN (${device.assetIds.join(',')}) AND Date = '${date}' AND Time >= '${time}'
        `);

            const deviceDataResults = await Promise.all(
                deviceQueries.map(query => connection.execute(query))
            );

            // Update device statuses in parallel
            const updatePromises = devicesToUpdate.map((device, index) => {
                const [data] = deviceDataResults[index];
                const status = data.length > 0 ? 1 : 0; // 1: Connected, 0: Disconnected

                return connection.execute(`
                UPDATE edge_devices 
                SET deviceState = ? 
                WHERE id = ?
            `, [status, device.id]);
            });

            await Promise.all(updatePromises);

            const endTime = process.hrtime(startTime); // End timer
            console.log(`Device status update completed in ${endTime[0]} seconds`);


            return true
            // return res.status(200).json({
            //     success: true,
            //     message: "Device statuses updated successfully",
            // });

        } catch (error) {
            console.error("Device status update failed:", error);

            return true
            // return res.status(500).json({
            //     success: false,
            //     message: "Device status update failed",
            //     error: error.message,
            // });
        }
    });
};

