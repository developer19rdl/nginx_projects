const { connection } = require('../config/dbSql2');
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

async function aggregateSensorData(machineId, deviceId, tagId, slaveId) {
    try {
        const fifteenMinutesAgo = moment().subtract(15, 'minutes');
        // console.log("fifteenMinutesAgo", fifteenMinutesAgo);

        // Aggregate query ignoring NULL values
        const [result] = await connection.execute(
            `SELECT SUM(value) as sum_value, AVG(value) as avg_value, MIN(value) as min_value, MAX(value) as max_value 
             FROM sensor_segregated_data_view 
             WHERE machineId = ? AND deviceId = ? AND slaveId = ? AND Tag_Id = ? 
             AND value IS NOT NULL 
             AND dateTime BETWEEN ? AND ?`,
            [machineId, deviceId, slaveId, tagId, fifteenMinutesAgo.toDate(), moment().toDate()]
        );

        // Check if there is no data in the result
        const aggregatedData = result[0].sum_value !== null ? result[0] : {
            sum_value: 0,
            avg_value: null,
            min_value: null,
            max_value: null
        };

        // Query to get the last non-null value
        const [lastRecord] = await connection.execute(
            `SELECT value FROM sensor_segregated_data_view 
             WHERE machineId = ? AND deviceId = ? AND slaveId = ? AND Tag_Id = ? 
             AND value IS NOT NULL 
             AND dateTime BETWEEN ? AND ? 
             ORDER BY dateTime DESC LIMIT 1`,
            [machineId, deviceId, slaveId, tagId, fifteenMinutesAgo.toDate(), moment().toDate()]
        );

        const obj = {
            aggregatedData: aggregatedData,
            rawValue: lastRecord[0] ? lastRecord[0].value : null // Check if lastRecord[0] exists
        };

        return obj;

    } catch (error) {
        console.log('Error aggregating sensor data:', error.message);
        throw error;  // Re-throw the error after logging it
    }
}



async function insertAggregatedData(aggregatedData, rawValue, machineId, deviceId, tagId, tagName, slaveId) {
    try {
        const latestValue = tagName == 'kWh' ? aggregatedData.sum_value : rawValue;

        // Only proceed if `latestValue` and aggregated values are not null
        if (latestValue !== null && aggregatedData.min_value !== null && aggregatedData.max_value !== null && aggregatedData.avg_value !== null) {

            const [AgrigateInsert] = await connection.execute(
                `INSERT INTO sensor_data (dateTime, machineId, deviceId, slaveId, Tag_Id, Tag_Name, value, Min, Max, Avg, isAggregate) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [moment().toDate(), machineId, deviceId, slaveId, tagId, tagName, latestValue, aggregatedData.min_value, aggregatedData.max_value, aggregatedData.avg_value, 1]
            );

            if (AgrigateInsert.affectedRows > 0) {
                // Insert successful
            } else {
                console.log("Aggregation failed", machineId, deviceId, tagId, tagName, slaveId);
            }
        } else {
            // console.log(`Skipping insert due to null values for machineId: ${machineId}, deviceId: ${deviceId}, tagId: ${tagId}, tagName: ${tagName}, slaveId: ${slaveId}`);
        }
    } catch (error) {
        console.error("Error during insertion:", error);
    }
}


// Handle data aggregation
async function handleDataAggregation(segregatedValue) {
    const { machineId, deviceId, slaveId, tagId, tagName } = segregatedValue;

    const { aggregatedData, rawValue } = await aggregateSensorData(machineId, deviceId, tagId, slaveId);
    await insertAggregatedData(aggregatedData, rawValue, machineId, deviceId, tagId, tagName, slaveId);
    await deleteIndividualRecords(machineId, deviceId, tagId, slaveId);
}

async function deleteIndividualRecords(machineId, deviceId, tagId, slaveId) {
    const fifteenMinutesAgo = moment().subtract(15, 'minutes');

    console.log("fifteenMinutesAgo", fifteenMinutesAgo);

    await connection.execute(
        `DELETE FROM sensor_segregated_data WHERE machineId = ? AND deviceId = ? AND slaveId = ? AND Tag_Id = ? AND isAggregate = 0 AND dateTime BETWEEN ? AND ?`,
        [machineId, deviceId, slaveId, tagId, fifteenMinutesAgo.toDate(), moment().toDate()]
    );
}

exports.SensorAggregate = async (req, res) => {
    cron.schedule('*/15 * * * *', async () => {
        const startTime = process.hrtime(); // Start timer
        console.log('Sensors Segregation start At:', moment().format('YYYY-MM-DD HH:mm:ss'));

        try {
            console.log("Aggregate Execution start");

            const [aggregatedTagIds] = await connection.execute(`
            SELECT deviceId, slaveId, Tag_Id, Tag_Name, machineId
            FROM machine_parameter_allocation 
            WHERE isSensor = 1;
        `);

            for (const { deviceId, slaveId, Tag_Name: tagName, Tag_Id: tagId, machineId } of aggregatedTagIds) {
                const aggregateValue = { machineId, deviceId, slaveId, tagId, tagName };
                await handleDataAggregation(aggregateValue);
            }

            const endTime = process.hrtime(startTime); // End timer
            const executionTime = endTime[0] * 1e3 + endTime[1] / 1e6; // Convert to milliseconds
            logger.info(`Sensor execution time: ${executionTime.toFixed(3)} ms`);

            console.log('Sensors Aggregation End At:', moment().format('YYYY-MM-DD HH:mm:ss'));


            return true;
            // Return success response with 200 status
            // return res.status(200).json({
            //     success: true,
            //     message: "Sensors aggregation successful",
            //     executionTime: `${executionTime.toFixed(3)} ms`
            // });

        } catch (err) {
            const endTime = process.hrtime(startTime); // End timer
            const executionTime = endTime[0] * 1e3 + endTime[1] / 1e6; // Convert to milliseconds
            logger.info(`Sensor execution time: ${executionTime.toFixed(3)} ms`);
            return true;
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