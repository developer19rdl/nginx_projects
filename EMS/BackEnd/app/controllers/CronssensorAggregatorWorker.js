const { parentPort, workerData } = require('worker_threads');
const { connection } = require('../config/dbSql2');
const moment = require('moment-timezone');

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
        throw error;
    }
}

async function handleDataAggregation(tagIds, startTime, endTime) {
    const aggregatedEntries = await Promise.all(tagIds.map(async (entry) => {
        const { deviceId, slaveId, Tag_Name: tagName, Tag_Id: tagId, machineId } = entry;
        const { aggregatedData, rawValue } = await aggregateSensorData(machineId, deviceId, tagId, slaveId, startTime, endTime);
        const latestValue = tagName === 'kWh' ? aggregatedData.sum_value : rawValue;

        if (latestValue !== null && aggregatedData.min_value !== null && aggregatedData.max_value !== null && aggregatedData.avg_value !== null) {
            return { machineId, deviceId, slaveId, tagId, tagName, aggregatedData, latestValue };
        } else {
            return null;
        }
    }));

    return aggregatedEntries.filter(entry => entry !== null);
}

(async () => {
    const { tagIds, startTime, endTime } = workerData;
    try {
        const aggregatedEntries = await handleDataAggregation(tagIds, startTime, endTime);
        parentPort.postMessage({ status: 'success', aggregatedEntries });
    } catch (error) {
        parentPort.postMessage({ status: 'error', message: error.message });
    }
})();
