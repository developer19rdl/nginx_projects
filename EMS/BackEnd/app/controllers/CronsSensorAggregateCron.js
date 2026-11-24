const { connection } = require('../config/dbSql2');
const cron = require('node-cron');
const moment = require('moment-timezone');
const winston = require('winston');


// Set up Winston logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Aggregate sensor data for a given time range
async function aggregateSensorData(machineId, deviceId, tagId, slaveId, startTime, endTime) {
    try {
        const [result] = await connection.execute(
            `SELECT SUM(value) as sum_value, AVG(value) as avg_value, MIN(value) as min_value, MAX(value) as max_value 
             FROM sensor_segregated_data_view 
             WHERE machineId = ? AND deviceId = ? AND slaveId = ? AND Tag_Id = ? 
             AND value IS NOT NULL 
             AND dateTime BETWEEN ? AND ?`,
            [machineId, deviceId, slaveId, tagId, startTime, endTime]
        );

        const aggregatedData = result[0].sum_value !== null ? result[0] : { sum_value: 0, avg_value: null, min_value: null, max_value: null };

        const [lastRecord] = await connection.execute(
            `SELECT value FROM sensor_segregated_data_view 
             WHERE machineId = ? AND deviceId = ? AND slaveId = ? AND Tag_Id = ? 
             AND value IS NOT NULL 
             AND dateTime BETWEEN ? AND ? 
             ORDER BY dateTime DESC LIMIT 1`,
            [machineId, deviceId, slaveId, tagId, startTime, endTime]
        );

        return { aggregatedData, rawValue: lastRecord[0] ? lastRecord[0].value : null };

    } catch (error) {
        logger.error('Error aggregating sensor data:', error.message);
        throw error;
    }
}

// Insert aggregated data in bulk
async function insertAggregatedDataBatch(entries) {
    try {
        if (entries.length === 0) return;

        // const values = entries.map(entry => `('${moment().toDate()}', ${entry.machineId}, ${entry.deviceId}, ${entry.slaveId}, ${entry.tagId}, '${entry.tagName}', ${entry.latestValue}, ${entry.aggregatedData.min_value}, ${entry.aggregatedData.max_value}, ${entry.aggregatedData.avg_value}, 1)`).join(',');

        const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        const values = entries.map(entry => `('${currentDateTime}', ${entry.machineId}, ${entry.deviceId}, ${entry.slaveId}, ${entry.tagId}, '${entry.tagName}', ${entry.latestValue}, ${entry.aggregatedData.min_value}, ${entry.aggregatedData.max_value}, ${entry.aggregatedData.avg_value}, 1)`).join(',');

        const query = `
            INSERT INTO sensor_data (dateTime, machineId, deviceId, slaveId, Tag_Id, Tag_Name, value, Min, Max, Avg, isAggregate)
            VALUES ${values}`;

        await connection.execute(query);
    } catch (error) {
        logger.error("Error during bulk insertion:", error.message);
    }
}


async function truncateSensorDataTable() {
    try {
        const query = `TRUNCATE TABLE sensor_segregated_data;`;
        await connection.execute(query);
    } catch (error) {
        logger.error("Error during table truncation:", error.message);
    }
}

// Handle data aggregation for a given tag entry
async function handleDataAggregation(aggregatedTagIds, startTime, endTime) {
    const aggregatedEntries = await Promise.all(aggregatedTagIds.map(async (entry) => {
        const { deviceId, slaveId, Tag_Name: tagName, Tag_Id: tagId, machineId } = entry;
        const { aggregatedData, rawValue } = await aggregateSensorData(machineId, deviceId, tagId, slaveId, startTime, endTime);

        // Determine latest value based on tagName (e.g., 'kWh' uses sum_value)
        const latestValue = tagName === 'kWh' ? aggregatedData.sum_value : rawValue;

        if (latestValue !== null && aggregatedData.min_value !== null && aggregatedData.max_value !== null && aggregatedData.avg_value !== null) {
            return { machineId, deviceId, slaveId, tagId, tagName, aggregatedData, latestValue };
        } else {
            return null; // Skip entries with null values
        }
    }));

    // Filter out any null entries
    return aggregatedEntries.filter(entry => entry !== null);
}

// Main sensor aggregation function
exports.SensorAggregateCron = async (req, res) => {
    cron.schedule('*/15 * * * *', async () => {
        const startTime = moment().subtract(15, 'minutes').toDate();
        const endTime = moment().toDate();
        const startHrTime = process.hrtime(); // Start timer for performance logging

        try {

            logger.info('Sensors Aggregation started at:', moment().format('YYYY-MM-DD HH:mm:ss'));

            // Fetch sensor tag IDs for aggregation
            const [aggregatedTagIds] = await connection.execute(`
                SELECT deviceId, slaveId, Tag_Id, Tag_Name, machineId
                FROM machine_parameter_allocation 
                WHERE isSensor = 1;
            `);

            // Perform data aggregation and insert in parallel
            const aggregatedEntries = await handleDataAggregation(aggregatedTagIds, startTime, endTime);
            await insertAggregatedDataBatch(aggregatedEntries);
            // await deleteIndividualRecordsBatch(aggregatedEntries, startTime, endTime);
            // Replace batch deletion with truncation
            await truncateSensorDataTable();

            const endHrTime = process.hrtime(startHrTime); // End timer
            const executionTime = endHrTime[0] * 1e3 + endHrTime[1] / 1e6; // Convert to milliseconds
            logger.info(`Sensor execution time: ${executionTime.toFixed(3)} ms`);

            console.log('Sensors Aggregation completed at:', moment().format('YYYY-MM-DD HH:mm:ss'));

            return true
            //  Return success response with 200 status
            // return res.status(200).json({
            //     success: true,
            //     message: "Sensors aggregation successful",
            //     executionTime: `${executionTime.toFixed(3)} ms`
            // });

        } catch (err) {
            const endHrTime = process.hrtime(startHrTime);
            const executionTime = endHrTime[0] * 1e3 + endHrTime[1] / 1e6;
            logger.error(`Error during sensor aggregation:  ${err}`);

            return true
            // Return error response
            // return res.status(500).json({
            //     success: false,
            //     message: "Sensors aggregation failed",
            //     error: err.message,
            //     executionTime: `${executionTime.toFixed(3)} ms`
            // });

        }
    });
};
