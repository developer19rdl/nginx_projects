const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { connection } = require('../config/dbSql2');


// Image extension
function getExtension(image) {
    const extension = image.substring(image.indexOf('/') + 1, image.indexOf(';'));
    if (extension === 'jpg') {
        return 'jpg';
    } else if (extension === 'png') {
        return 'png';
    } else if (extension === 'jpeg') {
        return 'jpeg';
    } else if (extension === 'mp4') {
        return 'mp4';
    } else if (extension === 'vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        return 'xlsx';
    } else {
        return extension;
    }
}

function storeFile(image, folder) {
    if (image) {
        const folderPath = path.join(`public/${folder}`);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });      // If the folder doesn't exist, create it
        }
        const extension = getExtension(image);
        const base64Data = image.split(',')[1];;
        const imageBuffer = Buffer.from(base64Data, 'base64');
        const imageName = `${folder}/${uuidv4()}.${extension}`;
        const imagePath = path.join(`public/`, imageName);
        fs.writeFileSync(imagePath, imageBuffer);
        return imageName;
    } else {
        return 'No image data found';
    }
};


// function uniqueId(callback) {
//     const fetch = 'SELECT * FROM supplier ORDER BY id DESC LIMIT 1';

//     sql.query(fetch, (err, results) => {
//         if (err) return callback(err, null);

//         if (results.length === 0) return callback(null, 'SUP-1');

//         const sId = results[0].sId || 'SUP-0'; 

//         // Extract the numeric part and increment by 1
//         const len = parseInt(sId.split('-')[1]);
//         const increment = len + 1;
//         const newStr = 'SUP-' + increment;

//         return callback(null, newStr);
//     });
// }

async function uniqueId(array) {
    const tabelName = array[0];
    const idPrefix = array[1];
    const uId = array[2];

    const fetch = `SELECT * FROM ${tabelName} ORDER BY id DESC LIMIT 1`;
    const [results] = await connection.execute(fetch);
    if (results.length === 0) return `${idPrefix}-1`;
    const string = results[0][uId] || `${idPrefix}-0`;
    const len = parseInt(string.split('-')[1]);
    const increment = len + 1;
    return `${idPrefix}-` + increment;
}


function exportFile(res, docPath, fileName) {
    const filePath = path.join(docPath);
    if (fs.existsSync(filePath)) {
        const fileExtension = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream'; // Default content type for unknown file types
        const exportedName = fileName + fileExtension;

        switch (fileExtension) {
            case '.pdf':
                contentType = 'application/pdf';
                break;
            case '.xlsx':
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case '.jpg':
            case '.jpeg':
                contentType = 'image/jpeg';
                break;
            case '.png':
                contentType = 'image/png';
                break;
        }

        // Set the appropriate headers for the response
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${exportedName}`);

        // Stream the file to the response
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } else {
        res.status(404).send('File not found');
    }
}




async function getMachineId() {
    try {
        const [machineRows] = await connection.execute(`SELECT id FROM meters
    
            WHERE meterType = 'Electric board (incomer)'
            LIMIT 1`, []
        );

        if (machineRows.length <= 0) {
            throw new Error("KEB machine not found!");
        }
        const meterId = machineRows[0].id;

        return meterId;
    } catch (error) {
        throw error;
    }
}





// Returns the energy tariff (Rs/unit + generator fuel cost) that was active on billingDate
// ('YYYY-MM-DD'), i.e. the latest energy_tariff row created on or before that date.
async function getActiveTariff(billingDate) {
    const FALLBACK_TARIFF = { energyCostPerUnit: 9.0, generatorFuelCostPerLtr: 0 };
    try {
        const [rows] = await connection.execute(
            `SELECT energyCostPerUnit, generatorFuelCostPerLtr
             FROM energy_tariff
             WHERE createdAt <= ?
             ORDER BY createdAt DESC
             LIMIT 1`,
            [`${billingDate} 23:59:59`]
        );
        if (rows.length) return rows[0];

        // No tariff configured as of billingDate yet (e.g. table just migrated) —
        // fall back to the earliest tariff on record, or a hardcoded default.
        const [fallbackRows] = await connection.execute(
            `SELECT energyCostPerUnit, generatorFuelCostPerLtr FROM energy_tariff ORDER BY createdAt ASC LIMIT 1`
        );
        return fallbackRows[0] || FALLBACK_TARIFF;
    } catch (error) {
        return FALLBACK_TARIFF;
    }
}




async function getGenratorMachineId() {
    try {
        const [machineRows] = await connection.execute(`SELECT id FROM meters
            WHERE meterType = 'Generator'
            LIMIT 1`, []
        );

        if (machineRows.length <= 0) {
            throw new Error("Genrator machine not found!");
        }
        const meterId = machineRows[0].id;

        return meterId;
    } catch (error) {
        throw error;
    }
}


/*
async function getSolarMeterId() {
    try {
        const [machineRows] = await connection.execute(`SELECT id FROM meters
            WHERE meterType = 'Solar'
            LIMIT 1`, []
        );

        if (machineRows.length <= 0) {
            throw new Error("Genrator machine not found!");
        }


        return machineRows;
    } catch (error) {
        throw error;
    }
}
*/




//server deplyee
/*
async function getPlantDistributerId(plantId, distributerId, feederId) {
    try {
        const [machineRows] = await connection.execute(`SELECT id FROM meters
    
            WHERE meterType = 'Distributors' AND
            plantId = ?
            LIMIT 1`, [plantId]
        );

        if (machineRows.length <= 0) {
            throw new Error("This plant Distributer not found!");
        }
        const meterId = machineRows[0].id;

        return meterId;
    } catch (error) {
        throw error;
    }
}*/


async function getPlantDistributerId(plantId, distributerId, feederId) {
    try {
        let query = '';
        let params = [];

        if (feederId) {
            query = `SELECT id FROM meters WHERE meterType = 'Feeder' AND feederId = ? LIMIT 1`;
            params.push(feederId);
        } else if (distributerId) {
            query = `SELECT id FROM meters WHERE meterType = 'Distributors' AND distributerId = ? LIMIT 1`;
            params.push(distributerId);
        } else if (plantId) {
            query = `SELECT id FROM meters WHERE meterType = 'Distributors' AND plantId = ? LIMIT 1`;
            params.push(plantId);
        } else {
            throw new Error("Please provide plantId, distributerId, or feederId.");
        }

        const [rows] = await connection.execute(query, params);

        if (rows.length === 0) {
            throw new Error("Plant, Distributer, or Feeder not found!");
        }

        return rows[0].id;

    } catch (error) {
        // Log error for debugging
        console.error("Error in getPlantDistributerId:", error.message);
        throw error;
    }
}









async function getPlant2DistributerId(plantId, distributerId, feederId) {
    try {

        let query = '';
        let params = [];

        if (feederId) {
            query = `SELECT id FROM meters WHERE meterType = 'Feeder' AND feederId = ? LIMIT 1`;
            params.push(feederId);
        } else if (distributerId) {
            query = `SELECT id FROM meters WHERE meterType = 'Feeder' AND distributerId = ?`;
            params.push(distributerId);
        } else if (plantId) {
            query = `SELECT id FROM meters WHERE meterType = 'Feeder' AND plantId = ?`;
            params.push(plantId);
        } else {
            throw new Error("Please provide plantId, distributerId, or feederId.");
        }
        const [rows] = await connection.execute(query, params);

        if (rows.length === 0) {
            throw new Error("Plant, Distributer, or Feeder not found!");
        }



        return rows.map(row => row.id);
    } catch (error) {
        throw error;
    }
}


async function getSolarMeterIds() {
    try {
        const [meterRows] = await connection.execute(`
            SELECT id FROM meters WHERE meterType = 'Solar'
        `);

        if (meterRows.length <= 0) {
            throw new Error("No solar meters found!");
        }

        return meterRows.map(row => row.id);
    } catch (error) {
        throw error;
    }
}

async function getWindmillMeterIds() {
    try {
        const [meterRows] = await connection.execute(`
            SELECT id FROM meters WHERE meterType = 'Windmill'
        `);

        if (meterRows.length <= 0) {
            throw new Error("No Windmill meters found!");
        }

        return meterRows.map(row => row.id);
    } catch (error) {
        throw error;
    }
}



/*

async function getMachineId(){
    try {
        const [machineRows] = await connection.execute(`SELECT mpa.machineId FROM meters
            INNER JOIN machine_parameter_allocation mpa ON mpa.deviceId = meters.deviceId AND mpa.slaveId = meters.slaveId
            WHERE meterType = 'Electric board (incomer)'
            LIMIT 1`, []
        );

        if(machineRows.length <= 0) {
            throw new Error("KEB machine not found!");
        }
        const machineId = machineRows[0].machineId;

        return machineId;
    } catch (error) {
        throw error;
    }
}*/

/*
async function getGenratorMachineId(){
    try {
        const [machineRows] = await connection.execute(`SELECT mpa.machineId FROM meters
            INNER JOIN machine_parameter_allocation mpa ON mpa.deviceId = meters.deviceId AND mpa.slaveId = meters.slaveId
            WHERE meterType = 'Generator'
            LIMIT 1`, []
        );

        if(machineRows.length <= 0) {
            throw new Error("Genrator machine not found!");
        }
        const machineId = machineRows[0].machineId;

        return machineId;
    } catch (error) {
        throw error;
    }
}


*/
module.exports = { storeFile, uniqueId, exportFile, getMachineId, getGenratorMachineId, getActiveTariff, getPlantDistributerId, getSolarMeterIds, getWindmillMeterIds, getPlant2DistributerId };