const { connection } = require('../config/dbSql2');
const logExecutionTime = require('../logExecutionTimeUtility'); // Adjust the path accordingly

// Fetch Tag names
const getDefaultTags = async (chartNo, selected, machineId, tags, slaveId) => {
    let tagRows;
    const tagObj = {};

    if (selected == 'default') {
        [tagRows] = await connection.execute(`
            SELECT Tag_Id, Tag_Name
            FROM machine_parameter_allocation
            WHERE machineId = ? AND slaveId = ? AND isSensor = ? AND isdefault = ? AND chartNumber = ?`,
            [machineId, slaveId, 1, 1, chartNo]
        );
    } else if (selected == 'selectAll') {
        const placeholders = tags.map(() => '?').join(',');

        [tagRows] = await connection.execute(`
            SELECT Tag_Id, Tag_Name
            FROM machine_parameter_allocation
            WHERE machineId = ? AND isSensor = ? AND Tag_Id IN (${placeholders})`,
            [machineId, 1, ...tags]
        );
    } else {
        throw new Error('Invalid selected type!');
    }

    tagRows.map(row => tagObj[row.Tag_Id] = row.Tag_Name);
    return tagObj;
};


// Generate random colors
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

async function getSensorData(machineId, tagId, sortDataType, intervalType, aggregateType, anchorTime) {
    const HourOffset = {
        '8hr': 8,
        '1day': 24,
        '1week': 168,
        '15days': 360,
        '30days': 720
    };

    const IntervalInSeconds = {
        '15min': 900,
        '30min': 1800,
        '1hr': 3600,
        '1day': 86400
    };

    const AggregateTypes = {
        'min': { val: 'MIN', col: 'Min' },
        'max': { val: 'MAX', col: 'Max' },
        'avg': { val: 'AVG', col: 'Avg' },
        'count': { val: 'SUM', col: 'value' }
    };

    let hourOffset = HourOffset[sortDataType];
    let interval = IntervalInSeconds[intervalType];
    let aggregate = AggregateTypes[aggregateType];

    if (!hourOffset || !interval || !aggregate) {
        throw new Error('Invalid request parameters!');
    }
    let aggregateVal = aggregate.val;
    let aggregateCol = aggregate.col;

    // Construct the SQL query.
    // Use a bare dateTime >= DATE_SUB(...) predicate (not TIMESTAMPDIFF) so MariaDB's
    // partition pruner can eliminate all but the relevant monthly partitions, and the
    // idx_chart_query index (machineId, Tag_Id, isAggregate, dateTime) is used for a
    // range scan instead of a full-table scan.
    //
    // The window is anchored to anchorTime (the machine's latest reported dateTime,
    // computed once per chart request in chartDataCalculation) rather than NOW() —
    // if the live feed stalls, "last 8 hours" still shows the most recent 8 hours of
    // real data instead of going blank. When the feed is current, anchorTime ~= NOW(),
    // so behavior is unchanged from before.
    const sqlQuery = `
        SELECT
            Tag_Id,
            Tag_Name,
            DATE_FORMAT(dateTime, '%Y-%m-%d %H:%i:00') AS interval_start,
            ${aggregateVal}(${aggregateCol}) AS aggregatedValue
        FROM
            sensor_data
        WHERE
            machineId = ? AND Tag_Id = ?
            AND isAggregate = 1
            AND dateTime >= DATE_SUB(?, INTERVAL ? HOUR)
        GROUP BY
            Tag_Id,
            Tag_Name,
            FLOOR(UNIX_TIMESTAMP(dateTime) / ?)
        ORDER BY
            interval_start;
    `;

    try {
        const [rows] = await connection.execute(sqlQuery, [machineId, tagId, anchorTime, hourOffset, interval]);
        return rows;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// Latest reported dateTime for this machine across any tag — the reference point
// "last N hours" is measured back from, instead of NOW(), so a stalled feed still
// shows its last known trend rather than an empty chart. Computed once per chart
// request (not per tag) so multiple tags on the same chart share one aligned window.
async function getAnchorTime(machineId) {
    const [rows] = await connection.execute(
        `SELECT MAX(dateTime) AS latest FROM sensor_data WHERE machineId = ? AND isAggregate = 1`,
        [machineId]
    );
    return rows[0]?.latest || null;
}

async function chartDataCalculation(chartNo, selected, machineId, sortDataType, interval, aggregation, tags, slaveId) {
    try {
        let result = [];
        let colorCodes = [];
        let maxValue = 0;

        if ((selected == 'selectAll' && tags.length > 0) || (selected == 'default')) {
            // Fetch tagIds
            const tagIds = await getDefaultTags(chartNo, selected, machineId, tags, slaveId);

            // One shared anchor for every tag in this chart, so multiple lines/bars
            // stay aligned on the same time window instead of each drifting to its
            // own last-reported time.
            const anchorTime = await getAnchorTime(machineId);

            const data = {};
            // Fetch data for each tagId and store in the data object
            for (const tagId in tagIds) {
                data[tagId] = await getSensorData(machineId, tagId, sortDataType, interval, aggregation, anchorTime);
            }


            // Transform the data to the desired format
            const transformedData = {};

            // Initialize the transformed data with 0 values for each tag
            for (const tagId in data) {
                data[tagId].forEach(entry => {
                    const { interval_start } = entry;
                    if (!transformedData[interval_start]) {
                        transformedData[interval_start] = {
                            dateTime: interval_start,
                        };
                        // Initialize each tagId with value 0
                        for (const [id, name] of Object.entries(tagIds)) {
                            transformedData[interval_start][name] = 0;
                        }
                    }
                });
            }

            // Populate the actual values from the fetched data
            for (const tagId in data) {
                data[tagId].forEach(entry => {
                    const { interval_start, aggregatedValue } = entry;
                    // transformedData[interval_start][tagIds[tagId]] = aggregatedValue == null ? 0 : (parseFloat(aggregatedValue)).toFixed(2);
                    transformedData[interval_start][tagIds[tagId]] = aggregatedValue == null ? 0 : parseFloat(aggregatedValue).toFixed(2);
                    if (Number(aggregatedValue) > maxValue) {
                        maxValue = Number(aggregatedValue) + 5;
                    }
                });
            }

            // Convert transformedData object to an array
            result = Object.values(transformedData);

            for (const [id, name] of Object.entries(tagIds)) {
                colorCodes.push({ lineName: name, stroke: getRandomColor() });
            }
        }
        return {
            colorCodes,
            maxValue: Math.ceil(maxValue),
            result
        };
    } catch (err) {
        throw err;
    }
};

const ChartData1 = async (req, res) => {
    try {
        const { chartNo, selected, machineId, sortDataType, interval, aggregation, tagIds: tags, slaveId } = req.body;

        const { colorCodes, maxValue, result } = await chartDataCalculation(chartNo, selected, machineId, sortDataType, interval, aggregation, tags, slaveId);

        return res.status(200).json({
            success: true,
            lines: colorCodes,
            maxValue: maxValue,
            data: result
        });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};


const ChartData2 = async (req, res) => {
    try {
        const { chartNo, selected, machineId, sortDataType, interval, aggregation, tagIds: tags, slaveId } = req.body;

        const { colorCodes, maxValue, result } = await chartDataCalculation(chartNo, selected, machineId, sortDataType, interval, aggregation, tags, slaveId);

        return res.status(200).json({
            success: true,
            lines: colorCodes,
            maxValue: maxValue,
            data: result
        });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};


const ChartData3 = async (req, res) => {
    try {
        const { chartNo, selected, machineId, sortDataType, interval, aggregation, tagIds: tags, slaveId } = req.body;

        const { colorCodes, maxValue, result } = await chartDataCalculation(chartNo, selected, machineId, sortDataType, interval, aggregation, tags, slaveId);

        return res.status(200).json({
            success: true,
            lines: colorCodes,
            maxValue: maxValue,
            data: result
        });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};


exports.ChartData1 = logExecutionTime(ChartData1);
exports.ChartData2 = logExecutionTime(ChartData2);
exports.ChartData3 = logExecutionTime(ChartData3);
