const mysql2 = require('mysql2/promise');
require('dotenv').config();

// Database connection
const connectionServer = mysql2.createPool({
    host: process.env.DB_HOST_SERVER,
    user: process.env.DB_USER_SERVER,
    database: process.env.DB_DATABASE_SERVER,
    password: process.env.DB_PASSWORD_SERVER,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// Custom error handling
class CustomErrorServer extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { connectionServer, CustomErrorServer };
