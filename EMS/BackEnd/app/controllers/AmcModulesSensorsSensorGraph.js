const { connection } = require('./config/dbSql2');

// Fetch Tag names
const getDefaultTags = async (chartNo, selected, machineId, tags) => {
    let tagRows;
    const tagObj = {};

    if (selected == 'default') {
        [tagRows] = await connection.execute(`
            SELECT Tag_Id, Tag_Name
            FROM machine_parameter_allocation
            WHERE machineId = ? AND isSensor = ? AND isdefault = ? AND chartNumber = ?`,
            [machineId, 1, 1, chartNo]
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

async function getSensorData(machineId, tagId, sortDataType, intervalType, aggregateType) {
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

    // Construct the SQL query
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
            AND TIMESTAMPDIFF(HOUR, dateTime, NOW()) <= ?
        GROUP BY 
            Tag_Id, 
            Tag_Name, 
            FLOOR(UNIX_TIMESTAMP(dateTime) / ?)
        ORDER BY 
            interval_start;
    `;

    try {
        const [rows] = await connection.execute(sqlQuery, [machineId, tagId, hourOffset, interval]);
        return rows;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function chartDataCalculation(chartNo, selected, machineId, sortDataType, interval, aggregation, tags) {
    try {
        let result = [];
        let colorCodes = [];
        let maxValue = 0;

        if ((selected == 'selectAll' && tags.length > 0) || (selected == 'default')) {
            // Fetch tagIds 
            const tagIds = await getDefaultTags(chartNo, selected, machineId, tags);
            // console.log(tagIds);

            const data = {};
            // Fetch data for each tagId and store in the data object
            for (const tagId in tagIds) {
                data[tagId] = await getSensorData(machineId, tagId, sortDataType, interval, aggregation);
            }

            // console.log(data)
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

exports.ChartData1 = async (req, res) => {
    try {
        const { chartNo, selected, machineId, sortDataType, interval, aggregation, tagIds: tags } = req.body;

        const { colorCodes, maxValue, result } = await chartDataCalculation(chartNo, selected, machineId, sortDataType, interval, aggregation, tags);

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

exports.ChartData2 = async (req, res) => {
    try {
        const { chartNo, selected, machineId, sortDataType, interval, aggregation, tagIds: tags } = req.body;

        const { colorCodes, maxValue, result } = await chartDataCalculation(chartNo, selected, machineId, sortDataType, interval, aggregation, tags);

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


exports.ChartData3 = async (req, res) => {
    try {
        const { chartNo, selected, machineId, sortDataType, interval, aggregation, tagIds: tags } = req.body;

        const { colorCodes, maxValue, result } = await chartDataCalculation(chartNo, selected, machineId, sortDataType, interval, aggregation, tags);

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
