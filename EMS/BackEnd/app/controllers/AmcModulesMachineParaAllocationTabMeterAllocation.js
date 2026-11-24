
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');
const { connection } = require('../config/dbSql2');
const excel = require('exceljs');
const utility = require('../utility/utilityFunction');

exports.slaveIdList = async (req, res) => {
  try {
    const [rows] = await connection.execute(
      `SELECT slaveId, MAX(slaveInformation) AS slaveInformation FROM sensors
       WHERE deviceId = ? AND slaveId IS NOT NULL GROUP BY slaveId ORDER BY slaveId`, [req.body.deviceId]
    );

    if (rows.length === 0) {
      return res.status(406).json({
        success: false,
        message: "slaveId List not found for the specified device"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Device Slave Ids",
      data: rows
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'An error occurred'
    });
  }
};

exports.store = async (req, res) => {
  try {
    const c = req.body;

    // Unique deviceId + slaveId check applies to all meter types
    const [meterFound] = await connection.execute(
      `SELECT id FROM meters WHERE deviceId = ? AND slaveId = ?`,
      [c.deviceId, c.slaveId]
    );
    if (meterFound.length > 0) {
      throw new Error("Duplicate entry: this deviceId and slaveId are already allocated");
    }

    // Enforce null hierarchy based on meterType alone (category is independent)
    const INCOMER_TYPES = ['Electric board (incomer)', 'Solar', 'Generator', 'Windmill', 'UPS', 'Isolation Transformer'];
    let distributerId = c.distributerId || null;
    let feederId = c.feederId || null;

    if (INCOMER_TYPES.includes(c.meterType)) {
      distributerId = null;
      feederId = null;
    } else if (c.meterType === 'Distributors') {
      feederId = null;
    }

    const insertQuery = `
        INSERT INTO meters (deviceId, slaveId, incomerId, plantId, distributerId, buildingId, category, feederId, displayName, meterType, meterTypeId, displayMeter, valueKW, dashDisplayNumber, counter_value)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       `;
    const values = [c.deviceId, c.slaveId, c.incomerId,
      c.plantId, distributerId, c.buildingId, c.category, feederId, c.displayName, c.meterType, c.meterTypeId || null,
      c.displayMeter, c.valueKW, c.dashDisplayNumber, c.counterValue ?? null];

    const [insertResult] = await connection.execute(insertQuery, values);

    if (insertResult.affectedRows > 0) {
      return res.status(200).json({ success: true, message: "Successfully added" });
    } else {
      throw new Error("Something went wrong!");
    }

  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
  }
};

exports.update = async (req, res) => {
  try {
    const c = req.body;
    const { id } = req.params;

    // Find the existing meter record
    const checkQuery = `
            SELECT * FROM meters
            WHERE id = ?
        `;
    const [meter] = await connection.execute(checkQuery, [id]);

    if (meter.length === 0) {
      throw new Error("Meter not found");
    }

    // Check if the requested meter allocation already exists
    const checkExistingQuery = `
            SELECT id FROM meters
            WHERE deviceId = ? AND slaveId = ? AND id <> ?
        `;
    const [existingMeter] = await connection.execute(checkExistingQuery, [c.deviceId, c.slaveId, id]);

    if (existingMeter.length > 0) {
      throw new Error(`deviceId and slaveId are already allocated to another meter`);
    }

    // Enforce null hierarchy based on meterType alone (category is independent)
    const INCOMER_TYPES = ['Electric board (incomer)', 'Solar', 'Generator', 'Windmill', 'UPS', 'Isolation Transformer'];
    let distributerId = c.distributerId || null;
    let feederId = c.feederId || null;

    if (INCOMER_TYPES.includes(c.meterType)) {
      distributerId = null;
      feederId = null;
    } else if (c.meterType === 'Distributors') {
      feederId = null;
    }

    // Update the meter attributes
    const updateQuery = `
            UPDATE meters
            SET
                displayName = ?,
                meterType = ?,
                meterTypeId = ?,
                incomerId = ?,
                deviceId = ?,
                slaveId = ?,
                plantId = ?,
                distributerId = ?,
                feederId = ?,
                displayMeter = ?,
                valueKW = ?,
                dashDisplayNumber = ?,
                category = ?,
                buildingId = ?,
                counter_value = ?
            WHERE
                id = ?
        `;
    const values = [c.displayName, c.meterType, c.meterTypeId || null, c.incomerId, c.deviceId, c.slaveId, c.plantId, distributerId, feederId, c.displayMeter, c.valueKW, c.dashDisplayNumber, c.category, c.buildingId, c.counterValue ?? null, id];

    const [uRows] = await connection.execute(updateQuery, values);

    if (uRows.affectedRows > 0) {
      return res.status(200).json({ success: true, message: "Meter updated successfully" });
    } else {
      throw new Error("Update failed, no rows affected");
    }

  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteQuery = `DELETE FROM meters WHERE id = ?`;
    const [result] = await connection.execute(deleteQuery, [id]);

    if (result.affectedRows > 0) {
      return res.status(200).json({ success: true, message: "Deleted Successfully!" });
    } else {
      return res.status(404).json({ success: false, message: "Meter not found" });
    }

  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
  }
};

exports.show = async (req, res) => {
  try {
    const showQuery = `
        SELECT
            meters.*,
            edge_devices.edgeDeviceName,
            plant_master.plantName,
            incomer_master.incomerName,
            distributors.distributorName,
            feeder_master.feederName
        FROM meters
        INNER JOIN plant_master  ON plant_master.id       = meters.plantId
        INNER JOIN edge_devices  ON edge_devices.id       = meters.deviceId
        LEFT  JOIN incomer_master ON incomer_master.id    = meters.incomerId
        LEFT  JOIN distributors   ON distributors.id      = meters.distributerId
        LEFT  JOIN feeder_master  ON feeder_master.id     = meters.feederId
    `;

    const [rows] = await connection.execute(showQuery);

    if (rows.length > 0) {
      return res.status(200).json({ success: true, message: "Meter Lists 1", data: rows });
    } else {
      return res.status(404).json({ success: false, message: "Meter not found" });
    }

  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
  }
};

exports.showdeviceNameby = async (req, res) => {
  try {

    const showQuery = `SELECT id, edgeDeviceName FROM edge_devices `;
    const [rows] = await connection.execute(showQuery);

    if (rows.length > 0) {
      return res.status(200).json({ success: true, data: rows });
    } else {
      return res.status(404).json({ success: false, message: "No vendors found" });
    }

  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
  }

};


exports.showslaveName = async (req, res) => {
  try {
    const { id } = req.params;
    const showQuery = `SELECT id, slaveId FROM machine_parameter_allocation Where deviceId =? `;
    const [rows] = await connection.execute(showQuery, [id]);

    if (rows.length > 0) {
      return res.status(200).json({ success: true, data: rows });
    } else {
      return res.status(404).json({ success: false, message: "No List found" });
    }

  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
  }

};

exports.storeexceldata = async (req, res) => {
  try {
    const base64URL = "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,";
    const base64Data = req.body.file.replace(base64URL, "");
    const buffer = Buffer.from(base64Data, "base64");

    const workbook = new excel.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.getWorksheet(1);

    const dataArray = [];

    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      if (rowNumber > 1) { // Skip headers, assuming they are in the first row
        const rowData = {
          edgeDeviceName: row.getCell(1).value,
          slaveId: row.getCell(2).value,
          displayName: row.getCell(3).value,
          meterType: row.getCell(4).value
        };
        dataArray.push(rowData);
      }
    });

    if (dataArray.length > 0) {
      for (const item of dataArray) {
        // Fetch deviceId from edge_devices table
        const deviceQuery = `SELECT id FROM edge_devices WHERE edgeDeviceName = ? `;
        const [deviceRows] = await connection.execute(deviceQuery, [item.edgeDeviceName]);

        if (deviceRows.length === 0) {
          throw new Error(`Device not found for name: ${item.edgeDeviceName} `);
        }

        const deviceId = deviceRows[0].id;

        // Insert data into machmeters table
        const storeQuery = `INSERT INTO machmeters(deviceId, slaveId, displayName, meterType)
        VALUES(?, ?, ?, ?)`;
        const values = [deviceId, item.slaveId, item.displayName, item.meterType];
        const [sRows] = await connection.execute(storeQuery, values);

        if (sRows.affectedRows === 0) {
          throw new Error("Something went wrong while inserting data!");
        }
      }

      return res.status(200).json({ success: true, message: "All data added successfully" });
    } else {
      throw new Error("No valid data found in the Excel sheet");
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
  }
};



// exports.getMeters = async (req, res) => {
//   try {
//     const { buildingId, distributerId, feederId } = req.body;


//     const params = [];

//     if (buildingId) {
//       query += ` AND m.buildingId = ?`;
//       params.push(buildingId);
//     }

//     if (distributerId) {
//       query += ` AND m.distributerId = ?`;
//       params.push(distributerId);
//     }

//     if (feederId) {
//       query += ` AND m.feederId = ?`;
//       params.push(feederId);
//     }

//     const [rows] = await connection.execute(query, params);

//     res.status(200).json({
//       status: true,
//       message: "Meters fetched successfully",
//       data: rows
//     });

//   } catch (err) {
//     res.status(500).json({
//       status: false,
//       message: "Internal server error"
//     });
//   }
// };

exports.getMeters = async (req, res) => {
  try {
    const { buildingId, distributerId, feederId } = req.query;

    let query = `
      SELECT 
        m.id, m.displayName as meterName,p.plantName,m.slaveId,d.edgeDeviceName

      FROM meters m
      join plant_master p on m.plantId = p.id
      join edge_devices d on m.deviceId = d.id
      WHERE 1 = 1
    `;
    const params = [];

    if (buildingId) {
      query += ` AND m.buildingId = ?`;
      params.push(buildingId);
    }
    if (distributerId) {
      query += ` AND m.distributerId = ?`;
      params.push(distributerId);
    }
    if (feederId) {
      query += ` AND m.feederId = ?`;
      params.push(feederId);
    }

    const [rows] = await connection.execute(query, params);

    return res.status(200).json({
      status: true,
      message: "Meters fetched successfully",
      data: rows
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Internal server error"
    });
  }
};

// exports.groupMeters = async (req, res) => {
//     const conn = await connection.getConnection(); 
//     await conn.beginTransaction();

//     try {
//         const { meterObj } = req.body;

//         if (!Array.isArray(meterObj) || meterObj.length === 0) {
//             throw new Error("Select at least one meter to group");
//         }


//         const query = `
//             INSERT INTO meter_groups 
//                 (categoryId, subCategoryId, buildingId, distributerId, feederId, meterId) 
//             VALUES ?
//         `;

//         await conn.query(query, [values]);

//         await conn.commit();

//         return res.status(200).json({
//             success: true,
//             message: "Meters grouped successfully",
//         });
//     } catch (err) {
//         await conn.rollback();

exports.groupMeters = async (req, res) => {
  const conn = await connection.getConnection();
  await conn.beginTransaction();

  try {
    const { meterObj } = req.body;

    if (!Array.isArray(meterObj) || meterObj.length === 0) {
      throw new Error("Select at least one meter to group");
    }

    // Check for duplicates based on first meter (or all if needed)
    for (const meter of meterObj) {
      const [existing] = await conn.query(
        `SELECT id FROM meter_groups 
         WHERE categoryId = ? AND buildingId = ? AND meterId=? AND subCategoryId = ?`,
        [meter.categoryId, meter.buildingId, meter.meterId, meter.subCategoryId]
      );

      if (existing.length > 0) {
        throw new Error(
          `Duplicate found: categoryId ${meter.categoryId} and buildingId ${meter.buildingId} and meterId ${meter.meterId}already exist`
        );
      }
    }

    // Prepare insert values
    const values = meterObj.map((meter) => [
      meter.categoryId,
      meter.subCategoryId,
      meter.buildingId,
      meter.distributerId,
      meter.feederId,
      meter.meterId,
    ]);

    const query = `
      INSERT INTO meter_groups 
        (categoryId, subCategoryId, buildingId, distributerId, feederId, meterId)
      VALUES ?
    `;

    await conn.query(query, [values]);
    await conn.commit();

    return res.status(200).json({
      success: true,
      message: "Meters grouped successfully",
    });
  } catch (err) {
    await conn.rollback();

    return res.status(400).json({
      success: false,
      message: err.message || "Internal server error",
    });
  } finally {
    conn.release();
  }
};

exports.ungroupMeters = async (req, res) => {
  try {
    const { meterIds } = req.body;

    if (!Array.isArray(meterIds) || meterIds.length === 0) {
      throw new Error("Select at least one meter to ungroup");
    }

    const placeholders = meterIds.map(() => '?').join(',');
    await connection.execute(`DELETE FROM meter_groups WHERE id IN (${placeholders})`, meterIds);

    return res.status(200).json({
      success: true,
      message: "Meters ungrouped successfully"
    });
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



exports.getMetersByCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.body;

    if (!categoryId && !subCategoryId) {
      return res.status(400).json({ message: "Either categoryId or subCategoryId is required" });
    }

    let query = `
      SELECT 
        mg.id,
        mg.categoryId,
        mg.subCategoryId,
        m.id AS meterId,
        m.displayName AS groupedMeter,
        m.meterType,
        m.deviceId,
        m.slaveId,
        d.edgeDeviceName
      FROM meter_groups mg
      JOIN meters m ON mg.meterId = m.id
      JOIN edge_devices d ON m.deviceId = d.id
      WHERE 1=1
    `;

    const params = [];

    // Add filters dynamically
    if (categoryId) {
      query += ` AND mg.categoryId = ?`;
      params.push(categoryId);
    }

    if (subCategoryId) {
      query += ` AND mg.subCategoryId = ?`;
      params.push(subCategoryId);
    }

    const [rows] = await connection.execute(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No meters found for given criteria" });
    }

    res.status(200).json({
      message: "Meters fetched successfully",
      data: rows,
    });

  } catch (error) {
    console.error("Error fetching meters:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


//////////////////////////////////////////subcategory graphs aoi///////////////


//     if (chartRows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No chart settings found"
//       });
//     }

//     const chart = chartRows[0];
//     let entityQuery = "";
//     let entityField = "";
//     let results = [];


//     // 3️⃣ Get all categories or subcategories
//     const [entities] = await connection.execute(entityQuery);

//     // 4️⃣ Loop through each and fetch meter + energy
//     for (const entity of entities) {
//       const [meters] = await connection.execute(
//         `SELECT meterId FROM meter_groups WHERE ${entityField} = ?`,
//         [entity.id]
//       );


//       const meterIds = meters.map((m) => m.meterId);

//       const [energy] = await connection.query(
//         `SELECT SUM(kWh) AS totalKwh 
//          FROM energy_data 
//          WHERE meterId IN (?)`,
//         [meterIds]
//       );

//       const totalKwh = energy[0]?.totalKwh || 0;

//       results.push({
//         id: entity.id,
//         name: entity.name,
//         kWh: totalKwh,
//         avgConsum: 12000
//       });
//     }



//     if (chartRows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No chart settings found",
//       });
//     }

//     const chart = chartRows[0];

//     let entityTable = "";
//     let entityNameField = "";
//     let entityField = "";
//     let entityId = chart.mainSubId;


//     // 3️⃣ Get selected entity name
//     const [entityRows] = await connection.execute(
//       `SELECT ${entityNameField} AS name FROM ${entityTable} WHERE id = ?`,
//       [entityId]
//     );

//     if (entityRows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Entity not found for chart settings",
//       });
//     }

//     const entityName = entityRows[0].name;

//     // 4️⃣ Fetch meters for that entity
//     const [meters] = await connection.execute(
//       `SELECT meterId FROM meter_groups WHERE ${entityField} = ?`,
//       [entityId]
//     );


//     const meterIds = meters.map((m) => m.meterId);

//     // 5️⃣ Fetch total energy for those meters
//     const [energy] = await connection.query(
//       `SELECT SUM(kWh) AS totalKwh FROM energy_data WHERE meterId IN (?)`,
//       [meterIds]
//     );

//     const totalKwh = parseFloat(energy[0]?.totalKwh || 0).toFixed(2);


exports.getSubCategoryEnergy = async (req, res) => {
  try {
    // 1️⃣ Get chart setting (active)
    const [chartRows] = await connection.execute(`
      SELECT id, chartName, type, category, mainSubId, chartNo
      FROM chart_settings
      LIMIT 1
    `);

    if (chartRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No chart settings found",
      });
    }

    const chart = chartRows[0];

    let entityTable = "";
    let entityNameField = "";
    let entityField = "";

    // 2️⃣ Determine type (Main Category or Sub Category)
    if (chart.category === "Main Category") {
      entityTable = "category";
      entityNameField = "categoryName";
      entityField = "categoryId";
    } else if (chart.category === "Sub Category") {
      entityTable = "subcategory";
      entityNameField = "subCategoryName";
      entityField = "subCategoryId";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid category type in chart settings",
      });
    }

    let entities = [];

    // 3️⃣ If mainSubId = 0 → fetch all entities, else only one
    if (chart.mainSubId == 0) {
      const [rows] = await connection.execute(
        `SELECT id, ${entityNameField} AS name FROM ${entityTable}`
      );
      entities = rows;
    } else {
      const [rows] = await connection.execute(
        `SELECT id, ${entityNameField} AS name FROM ${entityTable} WHERE id = ?`,
        [chart.mainSubId]
      );
      entities = rows;
    }

    if (entities.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No entities found for chart settings",
      });
    }

    const results = [];

    // 4️⃣ Loop through each entity and fetch meter + energy
    for (const entity of entities) {
      const [meters] = await connection.execute(
        `SELECT meterId FROM meter_groups WHERE ${entityField} = ?`,
        [entity.id]
      );

      if (meters.length === 0) {
        results.push({
          id: entity.id,
          name: entity.name,
          kWh: 0,
          avgConsum: 12000,
        });
        continue;
      }

      const meterIds = meters.map((m) => m.meterId);

      const [energy] = await connection.query(
        `SELECT SUM(kWh) AS totalKwh FROM energy_data WHERE meterId IN (?)`,
        [meterIds]
      );

      const totalKwh = parseFloat(energy[0]?.totalKwh || 0).toFixed(2);

      results.push({
        id: entity.id,
        name: entity.name,
        kWh: totalKwh,
        avgConsum: 12000,
      });
    }

    // ✅ Final Response
    return res.status(200).json({
      success: true,
      message: "Chart energy data fetched successfully",
      chartSettings: chart,
      data: results,
    });

  } catch (err) {
    console.error("Error in getSubCategoryEnergy:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};


//old

// exports.subCategoryEnergyByMonth = async (req, res) => {
//   try {
//     const { subCategoryId, month, chartNo } = req.body;

//     if (!subCategoryId || !month || !chartNo) {
//       return res.status(400).json({
//         success: false,
//         message: "subCategoryId, chartNo, and month are required",
//       });
//     }

//     // 1️⃣ Find entry in chart_settings for given subCategoryId + chartNo
//     const [chartRows] = await connection.execute(
//       `SELECT category, mainSubId 
//        FROM chart_settings 
//        WHERE mainSubId = ? AND chartNo = ?`,
//       [subCategoryId, chartNo]
//     );

//     if (chartRows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No chart settings found for this chartNo and subCategoryId",
//       });
//     }

//     const { category, mainSubId } = chartRows[0];
//     let meterQuery = "";
//     let meterParams = [];


//     // 3️⃣ Get meters linked to this category/subcategory
//     const [meterRows] = await connection.execute(meterQuery, meterParams);

//     if (meterRows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No meters found for this category/subcategory",
//       });
//     }

//     const meterIds = meterRows.map((m) => m.meterId);

//     // 4️⃣ Build dynamic energy table name (YYYY-MM)
//     const [year, monthNum] = month.split("-");
//     const tableName = `energy_data_${year}_${monthNum}`;


//     const [rows] = await connection.execute(query, meterIds);

//     // 6️⃣ Add hardcoded avgConsum & uv
//     const dataWithAvg = rows.map((row) => ({
//       ...row,
//       avgConsum: 240, // hardcoded
//       uv: 150,        // hardcoded
//     }));

//     // ✅ Final response
//     return res.status(200).json({
//       success: true,
//       message: `${category} daily energy data fetched successfully`,
//       data: dataWithAvg,
//     });


exports.subCategoryEnergyByMonth = async (req, res) => {
  try {
    const { subCategoryId, month, chartNo } = req.body;

    if (!subCategoryId || !month || !chartNo) {
      return res.status(400).json({
        success: false,
        message: "subCategoryId, chartNo, and month are required",
      });
    }

    // 1️⃣ Get chart details
    const [chartRows] = await connection.execute(
      `SELECT category, mainSubId 
       FROM chart_settings 
       WHERE chartNo = ?`,
      [chartNo]
    );

    if (chartRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No chart settings found for this chartNo",
      });
    }

    const { category, mainSubId } = chartRows[0];
    let meterIds = [];

    // 2️⃣ Handle normal case (mainSubId ≠ 0)
    if (mainSubId !== 0) {
      let meterQuery =
        category === "Main Category"
          ? `SELECT meterId FROM meter_groups WHERE categoryId = ?`
          : `SELECT meterId FROM meter_groups WHERE subCategoryId = ?`;

      const [meterRows] = await connection.execute(meterQuery, [mainSubId]);

      if (meterRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No meters found for this category/subcategory",
        });
      }

      meterIds = meterRows.map((m) => m.meterId);
    }

    // 3️⃣ Handle ALL case (mainSubId = 0)
    else {
      if (category === "Main Category") {
        // Get all category IDs from category table
        const [catRows] = await connection.execute(
          `SELECT id FROM category`
        );
        const categoryIds = catRows.map((c) => c.id);

        // Get all meters linked to all categories
        const [meterRows] = await connection.execute(
          `SELECT meterId FROM meter_groups WHERE categoryId IN (${categoryIds
            .map(() => "?")
            .join(",")})`,
          categoryIds
        );
        meterIds = meterRows.map((m) => m.meterId);
      } else if (category === "Sub Category") {
        // Get all subcategory IDs from sub_category table
        const [subRows] = await connection.execute(
          `SELECT id FROM subcategory`
        );
        const subCategoryIds = subRows.map((s) => s.id);

        // Get all meters linked to all subcategories
        const [meterRows] = await connection.execute(
          `SELECT meterId FROM meter_groups WHERE subCategoryId IN (${subCategoryIds
            .map(() => "?")
            .join(",")})`,
          subCategoryIds
        );
        meterIds = meterRows.map((m) => m.meterId);
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid category type in chart_settings",
        });
      }
    }

    if (meterIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No meters found for this configuration",
      });
    }

    // 4️⃣ Build dynamic energy table name (YYYY-MM)
    const [year, monthNum] = month.split("-");
    const tableName = `energy_data_${year}_${monthNum}`;

    // 5️⃣ Fetch daily kWh data
    const query = `
      SELECT 
        DATE_FORMAT(date, '%d') AS name,
        DATE_FORMAT(date, '%Y-%m-%d') AS fullDate,
        SUM(kWh) AS kWh
      FROM ${tableName}
      WHERE meterId IN (${meterIds.map(() => "?").join(",")})
      GROUP BY DATE(date)
      ORDER BY DATE(date)
    `;

    const [rows] = await connection.execute(query, meterIds);

    // 6️⃣ Add hardcoded avgConsum & uv
    const dataWithAvg = rows.map((row) => ({
      ...row,
      avgConsum: category === "Main Category" ? 200 : 240,
      uv: category === "Main Category" ? 180 : 150,
    }));

    // ✅ Final response
    return res.status(200).json({
      success: true,
      message: `${category} daily energy data fetched successfully`,
      data: dataWithAvg,
    });
  } catch (error) {
    console.error("Error fetching subcategory energy data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};




//old subcategory code 
// exports.subcategoryHourlyEnergy = async (req, res) => {
//   try {
//     const { subCategoryId, date } = req.body;

//     if (!subCategoryId || !date) {
//       return res.status(400).json({
//         success: false,
//         message: "categoryId and date are required",
//       });
//     }

//     // 1️⃣ Get all meterIds for this category
//     const [meters] = await connection.execute(
//       `SELECT meterId FROM meter_groups WHERE subCategoryId = ?`,
//       [subCategoryId]
//     );

//     if (meters.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No meters found for this subCategory",
//       });
//     }

//     const meterIds = meters.map((m) => m.meterId);
//     const placeholders = meterIds.map(() => "?").join(",");


//     const [rows] = await connection.execute(query, [date, ...meterIds]);

//     // 3️⃣ Define hour order and mapping
//     const hrOrder = [
//       "1AM","2AM","3AM","4AM","5AM","6AM","7AM","8AM","9AM","10AM","11AM",
//       "12PM","1PM","2PM","3PM","4PM","5PM","6PM","7PM","8PM","9PM","10PM","11PM","12AM"
//     ];

//     const hrMapping = {
//       "1AM": "1hr", "2AM": "2hr", "3AM": "3hr", "4AM": "4hr", "5AM": "5hr",
//       "6AM": "6hr", "7AM": "7hr", "8AM": "8hr", "9AM": "9hr", "10AM": "10hr", "11AM": "11hr",
//       "12PM": "12hr", "1PM": "13hr", "2PM": "14hr", "3PM": "15hr", "4PM": "16hr", "5PM": "17hr",
//       "6PM": "18hr", "7PM": "19hr", "8PM": "20hr", "9PM": "21hr", "10PM": "22hr", "11PM": "23hr", "12AM": "24hr"
//     };

//     // 4️⃣ Build full 24-hour data with defaults = 0
//     const dataMap = {};
//     rows.forEach(row => {
//       dataMap[row.HR] = parseFloat(row.totalKWh).toFixed(2);
//     });

//     const data = hrOrder.map(hr => ({
//       name: hrMapping[hr],
//       uv: 4000,
//       kWh:  dataMap[hr] || "0.00",
//       avgConsum:10
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Hourly energy data fetched successfully",
//       data,
//     });

exports.subcategoryHourlyEnergy = async (req, res) => {
  try {
    const { subCategoryId, date } = req.body;
    const chartNo = "chart1"; // 🔹 Default chart number

    if (!subCategoryId || !date) {
      return res.status(400).json({
        success: false,
        message: "subCategoryId and date are required",
      });
    }

    // 1️⃣ Get chart details to check which type (Main Category / Sub Category)
    const [chartSettings] = await connection.execute(
      `SELECT category FROM chart_settings WHERE chartNo = ?`,
      [chartNo]
    );

    if (chartSettings.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No chart found for chartNo = ${chartNo}`,
      });
    }

    const { category } = chartSettings[0]; // e.g., "Main Category" or "Sub Category"

    let meterQuery = "";
    let meterParams = [];

    // 2️⃣ Decide which table and column to use for meter_groups lookup
    if (category === "Main Category") {
      // Validate in category table
      const [catCheck] = await connection.execute(
        `SELECT id FROM category WHERE id = ?`,
        [subCategoryId]
      );
      if (catCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No such category found for given ID",
        });
      }
      meterQuery = `SELECT meterId FROM meter_groups WHERE categoryId = ?`;
      meterParams = [subCategoryId];

    } else if (category === "Sub Category") {
      // Validate in sub_category table
      const [subCatCheck] = await connection.execute(
        `SELECT id FROM subcategory WHERE id = ?`,
        [subCategoryId]
      );
      if (subCatCheck.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No such subcategory found for given ID",
        });
      }
      meterQuery = `SELECT meterId FROM meter_groups WHERE subCategoryId = ?`;
      meterParams = [subCategoryId];

    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid category type found in chart_settings",
      });
    }

    // 3️⃣ Get meters linked
    const [meters] = await connection.execute(meterQuery, meterParams);

    if (meters.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No meters found for this category/subcategory",
      });
    }

    const meterIds = meters.map(m => m.meterId);
    const placeholders = meterIds.map(() => "?").join(",");

    // 4️⃣ Fetch hourly data
    const [rows] = await connection.execute(
      `
        SELECT 
          HR,
          SUM(kWh) AS totalKWh
        FROM energy_data
        WHERE DATE(date) = ?
          AND meterId IN (${placeholders})
        GROUP BY HR
      `,
      [date, ...meterIds]
    );

    // 5️⃣ Define hours and mapping
    const hrOrder = [
      "1AM", "2AM", "3AM", "4AM", "5AM", "6AM", "7AM", "8AM", "9AM", "10AM", "11AM",
      "12PM", "1PM", "2PM", "3PM", "4PM", "5PM", "6PM", "7PM", "8PM", "9PM", "10PM", "11PM", "12AM"
    ];

    const hrMapping = {
      "1AM": "1hr", "2AM": "2hr", "3AM": "3hr", "4AM": "4hr", "5AM": "5hr",
      "6AM": "6hr", "7AM": "7hr", "8AM": "8hr", "9AM": "9hr", "10AM": "10hr", "11AM": "11hr",
      "12PM": "12hr", "1PM": "13hr", "2PM": "14hr", "3PM": "15hr", "4PM": "16hr", "5PM": "17hr",
      "6PM": "18hr", "7PM": "19hr", "8PM": "20hr", "9PM": "21hr", "10PM": "22hr", "11PM": "23hr", "12AM": "24hr"
    };

    // 6️⃣ Prepare final data
    const dataMap = {};
    rows.forEach(row => {
      dataMap[row.HR] = parseFloat(row.totalKWh).toFixed(2);
    });

    const data = hrOrder.map(hr => ({
      name: hrMapping[hr],
      uv: 4000,
      kWh: dataMap[hr] || "0.00",
      avgConsum: 10
    }));

    // ✅ Response
    return res.status(200).json({
      success: true,
      message: `${category} hourly energy data fetched successfully`,
      chartNo,
      data
    });

  } catch (err) {
    console.error("Error fetching hourly energy data:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message
    });
  }
};

//     if (meters.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No incomer meters found",
//       });
//     }


//       const latest = rows[0] || { kW: 0, pF: 0 };

//       data.push({
//         meterId: meter.id,
//         meterType: meter.meterType,
//         kW: parseFloat(latest.kW) || 0,
//         pF: parseFloat(latest.pF) || 0,
//       });
//     }

exports.getIncomerMeterLiveData = async (req, res) => {
  try {
    // 1. Gauges — simple select (addGaugeChart guarantees no duplicates now)
    const [gauges] = await connection.query(
      `SELECT gaugeNo, title, units FROM chart_gauges ORDER BY id ASC`
    );

    if (gauges.length === 0) {
      return res.status(404).json({ success: false, message: "No gauge charts found" });
    }

    // 2. Incomer meter — deviceId + slaveId
    const [meters] = await connection.query(
      `SELECT deviceId, slaveId FROM meters
       WHERE meterType = 'Electric board (Incomer)' LIMIT 1`
    );

    if (meters.length === 0) {
      return res.status(404).json({ success: false, message: "No incomer meters found" });
    }

    const { deviceId, slaveId } = meters[0];

    // 3. Fetch all needed tags in ONE query — kW tag read directly from snapshot
    const tagNames = [...new Set(gauges.map(g => g.units))];
    const placeholders = tagNames.map(() => '?').join(',');

    const [tagRows] = await connection.query(
      `SELECT tag_name, COALESCE(value, 0) AS value
       FROM live_tag_snapshot
       WHERE deviceId = ? AND slaveId = ? AND tag_name IN (${placeholders})`,
      [deviceId, slaveId, ...tagNames]
    );

    // 4. Build tag → value lookup map
    const tagMap = {};
    tagRows.forEach(row => { tagMap[row.tag_name] = parseFloat(row.value) || 0; });

    // 5. Build response
    const data = gauges.map(gauge => ({
      gaugeNo: gauge.gaugeNo,
      title:   gauge.title,
      units:   gauge.units,
      value:   tagMap[gauge.units] || 0,
    }));

    return res.status(200).json({
      success: true,
      message: "Gauge chart data fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Error fetching gauge chart data:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};


exports.addGaugeChart = async (req, res) => {
  try {
    const { gaugeNo, title, units } = req.body;

    if (!gaugeNo || !title || !units) {
      return res.status(400).json({ success: false, message: "gaugeNo, title, and units are required" });
    }

    // Delete ALL rows for this gaugeNo (wipes duplicates too), then insert fresh
    await connection.query(`DELETE FROM chart_gauges WHERE gaugeNo = ?`, [gaugeNo]);
    await connection.query(
      `INSERT INTO chart_gauges (gaugeNo, title, units) VALUES (?, ?, ?)`,
      [gaugeNo, title, units]
    );

    return res.status(200).json({ success: true, message: "Gauge saved successfully" });
  } catch (error) {
    console.error("Error saving gauge:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

////////////EB ENERGY CHART/////////////////////

const getCostForMonth = (monthDate) => {
  let applicableCost = null;

  for (let i = 0; i < costRows.length; i++) {
    if (new Date(costRows[i].created_at) <= monthDate) {
      applicableCost = costRows[i].energyCostPerUnit;
    } else {
      break;
    }
  }

  // ✅ IMPORTANT FIX: if no earlier cost, take first available
  if (applicableCost === null && costRows.length > 0) {
    applicableCost = costRows[0].energyCostPerUnit;
  }

  return applicableCost || 0;
};
exports.getEBMonthlyEnergy = async (req, res) => {
  try {

    // Step 1: Get meter IDs
    const [meters] = await connection.query(
      `SELECT id FROM meters WHERE meterType = ?`,
      ["Electric board (incomer)"]
    );

    if (meters.length === 0) {
      return res.json([]);
    }

    const meterIds = meters.map(m => m.id);

    // Step 2: Get ALL tariff history
    const [costRows] = await connection.query(
      `SELECT energyCostPerUnit, created_at 
       FROM addmaxenergy 
       ORDER BY created_at ASC`
    );

    const year = new Date().getFullYear();
    const results = [];

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // 🔥 Fixed helper
    const getCostForMonth = (monthDate) => {
      let applicableCost = null;

      for (let i = 0; i < costRows.length; i++) {
        if (new Date(costRows[i].created_at) <= monthDate) {
          applicableCost = costRows[i].energyCostPerUnit;
        } else {
          break;
        }
      }

      if (applicableCost === null && costRows.length > 0) {
        applicableCost = costRows[0].energyCostPerUnit;
      }

      return applicableCost || 0;
    };

    // Step 3: Loop months
    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, "0");
      const tableName = `energy_data_${year}_${monthStr}`;

      // const monthDate = new Date(`${year}-${monthStr}-01`);
      const monthDate = new Date(year, month, 0);
      const cost = getCostForMonth(monthDate);

      try {
        const [data] = await connection.query(
          `SELECT SUM(kWh) as totalEnergy 
           FROM ${tableName}
           WHERE meterId IN (?)`,
          [meterIds]
        );

        const totalEnergy = data[0].totalEnergy || 0;

        results.push({
          name: monthNames[month - 1],
          ebEnergy: Number(totalEnergy),
          ebCost: Number((totalEnergy * cost).toFixed(2))
        });

      } catch (err) {
        results.push({
          name: monthNames[month - 1],
          ebEnergy: 0,
          ebCost: 0
        });
      }
    }

    res.json(results);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.getEBDailyEnergy = async (req, res) => {
  try {
    const { month } = req.body;

    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    // ✅ Month mapping
    const monthMap = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04",
      May: "05", Jun: "06", Jul: "07", Aug: "08",
      Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    };

    const monthStr = monthMap[month];

    if (!monthStr) {
      return res.status(400).json({ message: "Invalid month" });
    }

    const year = new Date().getFullYear();
    const tableName = `energy_data_${year}_${monthStr}`;

    // ✅ Step 1: Get meter IDs
    const [meters] = await connection.query(
      `SELECT id FROM meters WHERE meterType = ?`,
      ["Electric board (incomer)"]
    );

    if (meters.length === 0) {
      return res.json([]);
    }

    const meterIds = meters.map(m => m.id);

    try {
      // ✅ Step 2: Group by day
      const [data] = await connection.query(
        `SELECT 
            DAY(date) as day,
            SUM(kWh) as totalEnergy
         FROM ${tableName}
         WHERE meterId IN (?)
         GROUP BY DAY(date)
         ORDER BY day ASC`,
        [meterIds]
      );

      // ✅ Step 3: Format response
      const results = data.map(row => ({
        name: `Day ${row.day}`,
        ebEnergy: Number(row.totalEnergy || 0)
      }));

      res.json(results);

    } catch (err) {
      // table not exist
      res.json([]);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};



exports.getEBHourlyEnergy = async (req, res) => {
  try {
    const { month, day } = req.body;

    if (!month || !day) {
      return res.status(400).json({ message: "Month and Day required" });
    }

    // ✅ Month mapping
    const monthMap = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04",
      May: "05", Jun: "06", Jul: "07", Aug: "08",
      Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    };

    const monthStr = monthMap[month];
    if (!monthStr) {
      return res.status(400).json({ message: "Invalid month" });
    }

    // ✅ Extract day number
    const dayNumber = parseInt(day.replace("Day ", ""));
    if (isNaN(dayNumber)) {
      return res.status(400).json({ message: "Invalid day format" });
    }

    const year = new Date().getFullYear();
    const tableName = `energy_data_${year}_${monthStr}`;

    // ✅ Step 1: Get meter IDs
    const [meters] = await connection.query(
      `SELECT id FROM meters WHERE meterType = ?`,
      ["Electric board (incomer)"]
    );

    if (meters.length === 0) {
      return res.json([]);
    }

    const meterIds = meters.map(m => m.id);

    try {
      // ✅ Step 2: Group by hour using dateTime
      const [data] = await connection.query(
        `SELECT 
            HOUR(dateTime) as hour,
            SUM(kWh) as totalEnergy
         FROM ${tableName}
         WHERE meterId IN (?) 
           AND DAY(dateTime) = ?
         GROUP BY HOUR(dateTime)
         ORDER BY hour ASC`,
        [meterIds, dayNumber]
      );

      // ✅ Step 3: Create full 24 hours
      const fullDayData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        totalEnergy: 0
      }));

      // ✅ Step 4: Fill DB values
      data.forEach(row => {
        fullDayData[row.hour].totalEnergy = Number(row.totalEnergy || 0);
      });

      // ✅ Step 5: Format response
      const results = fullDayData.map(row => ({
        name: `${row.hour.toString().padStart(2, "0")}:00`,
        ebEnergy: row.totalEnergy
      }));

      res.json(results);

    } catch (err) {
      res.json([]);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


///////////solar energy 

exports.getSolarMonthlyEnergy = async (req, res) => {
  try {

    // Step 1: Get Solar meter IDs
    const [meters] = await connection.query(
      `SELECT id FROM meters WHERE meterType = ?`,
      ["Solar"]
    );

    if (meters.length === 0) {
      return res.json([]);
    }

    const meterIds = meters.map(m => m.id);

    const year = new Date().getFullYear();
    const results = [];

    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Step 2: Loop months
    for (let month = 1; month <= 12; month++) {
      const monthStr = month.toString().padStart(2, "0");
      const tableName = `energy_data_${year}_${monthStr}`;

      try {
        const [data] = await connection.query(
          `SELECT SUM(kWh) as totalEnergy 
           FROM ${tableName}
           WHERE meterId IN (?)`,
          [meterIds]
        );

        const totalEnergy = data[0].totalEnergy || 0;

        results.push({
          name: monthNames[month - 1],
          solarEnergy: Number(totalEnergy)   // ✅ only energy
        });

      } catch (err) {
        // table not found / no data
        results.push({
          name: monthNames[month - 1],
          solarEnergy: 0
        });
      }
    }

    res.json(results);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getSolarDailyEnergy = async (req, res) => {
  try {
    const { month } = req.body;

    if (!month) {
      return res.status(400).json({ message: "Month is required" });
    }

    // ✅ Month mapping
    const monthMap = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04",
      May: "05", Jun: "06", Jul: "07", Aug: "08",
      Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    };

    const monthStr = monthMap[month];

    if (!monthStr) {
      return res.status(400).json({ message: "Invalid month" });
    }

    const year = new Date().getFullYear();
    const tableName = `energy_data_${year}_${monthStr}`;

    // ✅ Step 1: Get Solar meter IDs
    const [meters] = await connection.query(
      `SELECT id FROM meters WHERE meterType = ?`,
      ["Solar"]
    );

    if (meters.length === 0) {
      return res.json([]);
    }

    const meterIds = meters.map(m => m.id);

    try {
      // ✅ Step 2: Group by day
      const [data] = await connection.query(
        `SELECT 
            DAY(date) as day,
            SUM(kWh) as totalEnergy
         FROM ${tableName}
         WHERE meterId IN (?)
         GROUP BY DAY(date)
         ORDER BY day ASC`,
        [meterIds]
      );

      // ✅ Step 3: Format response
      const results = data.map(row => ({
        name: `Day ${row.day}`,
        solarEnergy: Number(row.totalEnergy || 0)  // ✅ only energy
      }));

      res.json(results);

    } catch (err) {
      // table not exist / no data
      res.json([]);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getSolarHourlyEnergy = async (req, res) => {
  try {
    const { month, day } = req.body;

    if (!month || !day) {
      return res.status(400).json({ message: "Month and Day required" });
    }

    // ✅ Month mapping
    const monthMap = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04",
      May: "05", Jun: "06", Jul: "07", Aug: "08",
      Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    };

    const monthStr = monthMap[month];
    if (!monthStr) {
      return res.status(400).json({ message: "Invalid month" });
    }

    // ✅ Extract day number
    const dayNumber = parseInt(day.replace("Day ", ""));
    if (isNaN(dayNumber)) {
      return res.status(400).json({ message: "Invalid day format" });
    }

    const year = new Date().getFullYear();
    const tableName = `energy_data_${year}_${monthStr}`;

    // ✅ Step 1: Get Solar meter IDs
    const [meters] = await connection.query(
      `SELECT id FROM meters WHERE meterType = ?`,
      ["Solar"]
    );

    if (meters.length === 0) {
      return res.json([]);
    }

    const meterIds = meters.map(m => m.id);

    try {
      // ✅ Step 2: Group by hour
      const [data] = await connection.query(
        `SELECT 
            HOUR(dateTime) as hour,
            SUM(kWh) as totalEnergy
         FROM ${tableName}
         WHERE meterId IN (?) 
           AND DAY(dateTime) = ?
         GROUP BY HOUR(dateTime)
         ORDER BY hour ASC`,
        [meterIds, dayNumber]
      );

      // ✅ Step 3: Ensure full 24 hours
      const fullDayData = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        totalEnergy: 0
      }));

      // ✅ Step 4: Fill DB values
      data.forEach(row => {
        fullDayData[row.hour].totalEnergy = Number(row.totalEnergy || 0);
      });

      // ✅ Step 5: Format response
      const results = fullDayData.map(row => ({
        name: `${row.hour.toString().padStart(2, "0")}:00`,
        solarEnergy: row.totalEnergy   // ✅ only energy
      }));

      res.json(results);

    } catch (err) {
      res.json([]);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};



//////building wise energy comparison

exports.getBuildingOtherEnergy = async (req, res) => {
  try {
    const { buildingId, month } = req.body;

    if (!buildingId || !month) {
      return res.status(400).json({ message: "buildingId and month required" });
    }

    // ✅ Month mapping
    const monthMap = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04",
      May: "05", Jun: "06", Jul: "07", Aug: "08",
      Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    };

    const monthStr = monthMap[month];
    if (!monthStr) {
      return res.status(400).json({ message: "Invalid month" });
    }

    const year = new Date().getFullYear();
    const tableName = `energy_data_${year}_${monthStr}`;

    // ✅ Step 1: Get meter IDs (exclude Solar & EB)
    const [meters] = await connection.query(
      `SELECT id 
       FROM meters 
       WHERE buildingId = ? 
         AND meterType NOT IN (?, ?)`,
      [buildingId, "Solar", "Electric board (incomer)"]
    );

    if (meters.length === 0) {
      return res.json([]);
    }

    const meterIds = meters.map(m => m.id);

    try {
      // ✅ Step 2: Group by DAY
      const [data] = await connection.query(
        `SELECT 
            DAY(date) as day,
            SUM(kWh) as totalEnergy
         FROM ${tableName}
         WHERE meterId IN (?)
         GROUP BY DAY(date)
         ORDER BY day ASC`,
        [meterIds]
      );

      // ✅ Step 3: Format response
      const results = data.map(row => ({
        name: `Day ${row.day}`,
        totalEnergy: Number(row.totalEnergy || 0)
      }));

      res.json(results);

    } catch (err) {
      // table not exist
      res.json([]);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};



exports.getBuildingHourlyEnergy = async (req, res) => {
  try {
    const { buildingId, month, day } = req.body;

    if (!buildingId || !month || !day) {
      return res.status(400).json({
        message: "buildingId, month and day required"
      });
    }

    // ✅ Month mapping
    const monthMap = {
      Jan: "01", Feb: "02", Mar: "03", Apr: "04",
      May: "05", Jun: "06", Jul: "07", Aug: "08",
      Sep: "09", Oct: "10", Nov: "11", Dec: "12"
    };

    const monthStr = monthMap[month];
    if (!monthStr) {
      return res.status(400).json({ message: "Invalid month" });
    }

    // ✅ Extract day number (Day 1 → 1)
    const dayNumber = parseInt(day.replace("Day ", ""));
    if (isNaN(dayNumber)) {
      return res.status(400).json({ message: "Invalid day format" });
    }

    const year = new Date().getFullYear();
    const tableName = `energy_data_${year}_${monthStr}`;

    // ✅ Step 1: Get meters for building (exclude Solar & EB)
    const [meters] = await connection.query(
      `SELECT id 
       FROM meters 
       WHERE buildingId = ?
       AND meterType NOT IN (?, ?)`,
      [buildingId, "Solar", "Electric board (incomer)"]
    );

    if (meters.length === 0) {
      return res.json([]);
    }

    const meterIds = meters.map(m => m.id);

    try {
      // ✅ Step 2: Group by hour
      const [data] = await connection.query(
        `SELECT 
            HOUR(dateTime) as hour,
            SUM(kWh) as totalEnergy
         FROM ${tableName}
         WHERE meterId IN (?) 
           AND DAY(dateTime) = ?
         GROUP BY HOUR(dateTime)
         ORDER BY hour ASC`,
        [meterIds, dayNumber]
      );

      // ✅ Step 3: Ensure full 24 hours
      const fullDay = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        totalEnergy: 0
      }));

      data.forEach(row => {
        fullDay[row.hour].totalEnergy = Number(row.totalEnergy || 0);
      });

      // ✅ Step 4: Format response
      const results = fullDay.map(row => ({
        name: `${row.hour.toString().padStart(2, "0")}:00`,
        totalEnergy: row.totalEnergy
      }));

      res.json(results);

    } catch (err) {
      res.json([]);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};


// ── Dashboard Summary Cards ────────────────────────────────────────────────────
const CO2_FACTOR = 0.82; // India CEA 2023 — kg CO2 per kWh

exports.getDashboardSummary = async (req, res) => {
  try {
    const { plantId } = req.query;

    const params = [];
    let plantFilter = '';
    if (plantId) {
      plantFilter = 'AND m.plantId = ?';
      params.push(plantId);
    }

    // Join live_tag_snapshot by deviceId + slaveId; kW = (rWatts+yWatts+bWatts)/1000
    const [rows] = await connection.query(`
      SELECT
        m.plantId,
        pm.plantName,
        m.meterType,
        COALESCE(kwh_snap.value, 0) AS kWh,
        COALESCE(
          (COALESCE(rw.value, 0) + COALESCE(yw.value, 0) + COALESCE(bw.value, 0)) / 1000,
          0
        ) AS kW
      FROM meters m
      INNER JOIN plant_master pm ON pm.id = m.plantId
      LEFT JOIN live_tag_snapshot kwh_snap
        ON kwh_snap.deviceId = m.deviceId AND kwh_snap.slaveId = m.slaveId AND kwh_snap.tag_name = 'kWh'
      LEFT JOIN live_tag_snapshot rw
        ON rw.deviceId = m.deviceId AND rw.slaveId = m.slaveId AND rw.tag_name = 'rWatts'
      LEFT JOIN live_tag_snapshot yw
        ON yw.deviceId = m.deviceId AND yw.slaveId = m.slaveId AND yw.tag_name = 'yWatts'
      LEFT JOIN live_tag_snapshot bw
        ON bw.deviceId = m.deviceId AND bw.slaveId = m.slaveId AND bw.tag_name = 'bWatts'
      WHERE m.meterType IN (
        'Electric board (incomer)', 'Solar', 'Generator', 'Windmill', 'UPS'
      )
      ${plantFilter}
      ORDER BY m.plantId
    `, params);

    const plantMap = {};
    for (const row of rows) {
      const key = row.plantId;
      if (!plantMap[key]) {
        plantMap[key] = {
          plantId:     row.plantId,
          plantName:   row.plantName,
          eb:          { kW: 0, kWh: 0 },
          greenEnergy: { kW: 0, kWh: 0 },
          generator:   { kW: 0, kWh: 0 },
          co2:         { kg: 0 },
          alert:       { count: 0 },
        };
      }
      const p    = plantMap[key];
      const type = (row.meterType || '').toLowerCase();
      const kw   = parseFloat(row.kW)  || 0;
      const kwh  = parseFloat(row.kWh) || 0;

      if (type === 'electric board (incomer)') {
        p.eb.kW  += kw;
        p.eb.kWh += kwh;
      } else if (type === 'solar' || type === 'windmill') {
        p.greenEnergy.kW  += kw;
        p.greenEnergy.kWh += kwh;
      } else if (type === 'generator') {
        p.generator.kW  += kw;
        p.generator.kWh += kwh;
      }
    }

    for (const p of Object.values(plantMap)) {
      p.eb.kW           = parseFloat(p.eb.kW.toFixed(2));
      p.eb.kWh          = parseFloat(p.eb.kWh.toFixed(2));
      p.greenEnergy.kW  = parseFloat(p.greenEnergy.kW.toFixed(2));
      p.greenEnergy.kWh = parseFloat(p.greenEnergy.kWh.toFixed(2));
      p.generator.kW    = parseFloat(p.generator.kW.toFixed(2));
      p.generator.kWh   = parseFloat(p.generator.kWh.toFixed(2));
      p.co2.kg          = parseFloat((p.eb.kWh * CO2_FACTOR).toFixed(2));
    }

    return res.status(200).json({ success: true, data: Object.values(plantMap) });
  } catch (error) {
    console.error('getDashboardSummary error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
