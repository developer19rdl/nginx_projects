const fs = require('fs');
const path = require('path');

function logError(error) {
    const logFilePath = 'error.log';
    const timestamp = new Date().toISOString();
    let errorMessage = `\nDate-Time: ${timestamp} `;

    // Add error name and message
    errorMessage += ` Message: ${error.message}\n`;

    // Add stack trace if available
    if (error.stack) {
        errorMessage += `${error.stack}\n`;
    }


    // Remove log entries older than 24 hours
    /* 
     const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours in milliseconds
     try {
         const logContent = fs.readFileSync(logFilePath, 'utf8');
         const lines = logContent.split('\n').filter(line => {
             if (line.trim() === '') return true; // Keep empty lines
             const matchResult = line.match(/Date-Time: (.*?)(?= )/);
             if (!matchResult || !matchResult[1]) return false; // Check for null match result or timestamp
             const logTimestamp = Date.parse(matchResult[1]); // Extract timestamp from log line
             return !isNaN(logTimestamp) && logTimestamp >= cutoffTime;
         });
         fs.writeFileSync(logFilePath, lines.join('\n'));
     } catch (err) {
         console.error('Error removing old log entries:', err);
     }
 */


    // Append error message to the error.log file
    fs.appendFile(logFilePath, errorMessage, (err) => {
        if (err) {
            console.error('Error writing to error log:', err);
        }
    });
}

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
    logError(error);
});

// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logError(reason);
});