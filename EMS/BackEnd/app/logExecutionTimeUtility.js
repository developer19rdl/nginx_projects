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

const logExecutionTime = (fn) => {
    return async function (...args) {
        const startTime = process.hrtime(); // Start timer
        try {
            const result = await fn.apply(this, args); // Execute the function
            const endTime = process.hrtime(startTime); // End timer
            const executionTimeMs = endTime[0] * 1e3 + endTime[1] / 1e6; // Convert to milliseconds
            const executionTimeSec = executionTimeMs / 1000; // Convert to seconds
            logger.info(`${fn.name} execution time: ${executionTimeSec.toFixed(3)} s (${executionTimeMs.toFixed(3)} ms)`);
            return result;
        } catch (err) {
            const endTime = process.hrtime(startTime); // End timer
            const executionTimeMs = endTime[0] * 1e3 + endTime[1] / 1e6; // Convert to milliseconds
            const executionTimeSec = executionTimeMs / 1000; // Convert to seconds
            logger.error(`${fn.name} failed execution time: ${executionTimeSec.toFixed(3)} s (${executionTimeMs.toFixed(3)} ms)`);
            throw err;
        }
    };
};

module.exports = logExecutionTime;