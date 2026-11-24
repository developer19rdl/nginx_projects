const { connection, CustomError } = require('../config/dbSql2.js');
const utility = require('../utility/utilityFunction');
const bcrypt = require('bcrypt');

exports.store = async (req, res) => {
    try {
        const { operatorId, Password, machine_tag } = req.body;

        const checkQuery = `
            SELECT operator.*, login.id as loginId, login.login_time, login.logout_time, login.operatorId AS loggedIn 
            FROM operator 
            LEFT JOIN login ON operator.operatorId = login.operatorId AND login.logout_time IS NULL
            WHERE operator.operatorId = ?`;
        const checkValues = [operatorId];
        const [checkRows] = await connection.execute(checkQuery, checkValues);

        if (checkRows.length === 0) {
            throw new CustomError("Invalid operatorId", 400);
        }

        const { operatorName, Password: operatorPassword, loginId, login_time, logout_time, loggedIn } = checkRows[0];

        const passwordsMatch = await bcrypt.compare(Password, operatorPassword);

        if (!passwordsMatch) {
            throw new CustomError("Invalid Password", 400);
        }

        const current_time = new Date();
        const login_date = current_time.toISOString().slice(0, 10);

        const [machines] = await connection.execute(`SELECT id as machineId FROM machines WHERE machine_tag = ?`, [machine_tag]);

        if (machines.length === 0) {
            throw new CustomError(`Machine not found!`, 404);
        }
        const { machineId } = machines[0];

        // Update the existing session if logout_time is NULL
        if (loggedIn) {
            const logout_time = current_time;
            await connection.execute(
                `UPDATE login SET logout_time = ?, total_Time = TIMESTAMPDIFF(SECOND, login_time, ?) WHERE id = ? `, 
                [logout_time, logout_time, loginId]
            );
        }

        // Check for any active session for the operator
        const [activeSessions] = await connection.execute(
            `SELECT id as activeLoginId, login_time FROM login WHERE operatorId = ? AND logout_time IS NULL`,
            [operatorId]
        );

        if (activeSessions.length > 0) {
            const { activeLoginId, login_time: activeLoginTime } = activeSessions[0];
            const logout_time = current_time;
            await connection.execute(
                `UPDATE login SET logout_time = ?, total_Time = TIMESTAMPDIFF(SECOND, login_time, ?) WHERE id = ? `,
                [logout_time, logout_time, activeLoginId]
            );
        }

        // Insert a new login record
        const storeQuery = 'INSERT INTO login (operatorId, machine_tag, login_time, login_date) VALUES (?, ?, ?, ?)';
        const storeValues = [operatorId, machineId, current_time, login_date];
        await connection.execute(storeQuery, storeValues);

        return res.status(200).json({
            success: true,
            message: "Operator logged in successfully",
            operatorName: operatorName
        });
    } catch (err) {
        console.error("Error:", err);
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};


// exports.logout = async (req, res) => {
//     try {
//         const { operatorId, machine_tag } = req.body;

//         // Input validation
//         if (!operatorId || !machine_tag) {
//             throw new CustomError('OperatorId and MachineTag are required', 400);
//         }

//         // Get current timestamp for logout time
//         const logoutTime = new Date();

//         // Update the logout_time and calculate the difference for the operator in the login table
//         const updateQuery = `
//             UPDATE login 
//             SET logout_time = ?, total_time = TIMESTAMPDIFF(SECOND, login_time, ?) 
//             WHERE operatorId = ? AND machine_tag = ? AND logout_time IS NULL`;
//         const updateValues = [logoutTime, logoutTime, operatorId, machine_tag];
//         const [updateResult] = await connection.execute(updateQuery, updateValues);


//             if (selectRows.length > 0) {
//                 const total_time = selectRows[0].total_time;

//                 // Format total time to hh:mm:ss
//                 const hours = Math.floor(total_time / 3600);
//                 const minutes = Math.floor((total_time % 3600) / 60);
//                 const seconds = total_time % 60;
//                 const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;



// exports.logout = async (req, res) => {
//     try {
//         const { operatorId, machine_tag } = req.body;

//         // Input validation
//         if (!operatorId || !machine_tag) {
//             throw new CustomError('OperatorId and MachineTag are required', 400);
//         }

//         // Get current timestamp for logout time
//         const logoutTime = new Date();

//         // Update the logout_time and calculate the difference for the operator in the login table
//         const updateQuery = `
//             UPDATE login
       
//             SET logout_time = ?, total_time = TIMESTAMPDIFF(SECOND, login_time, ?)
//             WHERE login.operatorId = ? AND machines.machine_tag = ? AND logout_time IS NULL;
//         `;
//         const updateValues = [logoutTime, logoutTime, operatorId, machine_tag];
//         const [updateResult] = await connection.execute(updateQuery, updateValues);


//             if (machines.length === 0) {
//                 throw new CustomError(`Machine not found!`, 404);
//             }
//             const { machineId } = machines[0];
    
//             if (selectRows.length > 0) {
//                 const total_time = selectRows[0].total_time;

//                 // Format total time to hh:mm:ss
//                 const hours = Math.floor(total_time / 3600);
//                 const minutes = Math.floor((total_time % 3600) / 60);
//                 const seconds = total_time % 60;
//                 const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;



exports.logout = async (req, res) => {
    try {
        const { operatorId, machine_tag } = req.body;

        // Input validation
        if (!operatorId || !machine_tag) {
            throw new CustomError('OperatorId and MachineTag are required', 400);
        }

        // Get current timestamp for logout time
        const logoutTime = new Date();

        // Update the logout_time and calculate the difference for the operator in the login table
        const updateQuery = `
            UPDATE login
            INNER JOIN machines ON machines.id = login.machine_tag
            SET logout_time = ?, total_time = TIMESTAMPDIFF(SECOND, login_time, ?)
            WHERE login.operatorId = ? AND machines.machine_tag = ? AND logout_time IS NULL;
        `;
        const updateValues = [logoutTime, logoutTime, operatorId, machine_tag];
        const [updateResult] = await connection.execute(updateQuery, updateValues);

        if (updateResult.affectedRows > 0) {
            // Fetch the updated row to get total time
            const selectQuery = `
                SELECT total_time 
                FROM login 
                INNER JOIN machines ON machines.id = login.machine_tag
                WHERE login.operatorId = ? AND machines.machine_tag = ? 
                ORDER BY logout_time DESC 
                LIMIT 1;
            `;
            const [selectRows] = await connection.execute(selectQuery, [operatorId, machine_tag]);

            if (selectRows.length > 0) {
                const total_time = selectRows[0].total_time;

                // Format total time to hh:mm:ss
                const hours = Math.floor(total_time / 3600);
                const minutes = Math.floor((total_time % 3600) / 60);
                const seconds = total_time % 60;
                const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                return res.status(200).json({ 
                    success: true, 
                    message: 'Operator and machine logged out successfully'
            
                });
            } else {
                throw new CustomError('Failed to retrieve total time', 500);
            }
        } else {
            throw new CustomError('No active login session found for the operator and machine', 404);
        }
    } catch (err) {
        console.error("Error occurred during logout:", err);
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred during logout' });
    }
};



// exports.show = (req, res) => {
//     try {
//         const { filterType, operatorId, machine_tag, fromDate, toDate } = req.body;

//         let whereClause = '';
//         let queryParams = [];



//         // Now you can bind values to the placeholders in your query and execute it against your database.
//         sql.query(fetch, queryParams, (err, results) => {
//             if (err) {
//                 console.error("Error executing SQL query:", err);
//                 return res.status(500).json({ success: false, message: "Internal server error" });
//             }

//             if (results.length === 0) {
//                 return res.status(200).json({
//                     success: true,
//                     message: "Login list",
//                     data: [] // Empty data array as no results found
//                 });
//             }


//         let fetch = '';


//         // Execute the query
//         sql.query(fetch, [], (err, results) => {
//             if (err) {
//                 console.error("Error executing SQL query:", err);
//                 return res.status(500).json({ success: false, message: "Internal server error" });
//             }
