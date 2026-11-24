const { connection, CustomError } = require('./config/dbSql2');
const utility = require('../utility/utilityFunction');
const bcrypt = require('bcrypt');
const moment = require('moment-timezone');


exports.MachineActiveStatusCount = async (req, res) => {
    try {
        // Fetch all machines from the database
        const [machines, machineFields] = await connection.execute(
            `SELECT * FROM machines`
        );

        // Initialize counters and lists
        let downMachinesCount = 0;
        let idleCount = 0;
        let machineRunList = [];
        let downMachineNameList = [];
        let idleMachineList = [];

        // Iterate through the machines to count and categorize
        machines.forEach(machine => {
            if (machine.isDownTime) {
                downMachinesCount++;
                downMachineNameList.push(machine.machine_name);
            } else if (machine.isIdle) {
                idleCount++;
                idleMachineList.push(machine.machine_name);
            } else {
                machineRunList.push(machine.machine_name);
            }
        });

        const totalMachineCount = machines.length;
        const machineRunningCount = totalMachineCount - downMachinesCount - idleCount;

        // Return the response
        return res.status(200).json({
            success: true,
            message: "Active downtime count retrieved successfully",
            data: {
                running: machineRunningCount,
                downTime: downMachinesCount,
                downMachineList: downMachineNameList,
                idle: idleCount,
                idleMachineList
            }
        });

    } catch (err) {
        return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
    }
};

