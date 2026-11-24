const { connection } = require('../config/dbSql2');



//old
// exports.searchCategoryEnergy = async (req, res) => {
//   try {
//     const { categoryId, buildingId, floorId } = req.body;


//     const params = [];

//     // Dynamic filters
//     if (categoryId) {
//       query += ` AND c.id = ?`;
//       params.push(categoryId);
//     }

//     if (buildingId) {
//       query += ` AND c.buildingId = ?`;
//       params.push(buildingId);
//     }

//     if (floorId) {
//       query += ` AND c.floorId = ?`;
//       params.push(floorId);
//     }

//     query += ` GROUP BY c.id, c.categoryName ORDER BY c.categoryName`;

//     const [rows] = await connection.execute(query, params);


//     return res.status(200).json({
//       success: true,
//       message: "Category energy data fetched successfully",
//       data,
//     });

exports.searchCategoryEnergy = async (req, res) => {
  try {
    const { chartNo } = req.body;

    if (!chartNo) {
      return res.status(400).json({ success: false, message: "chartNo is required" });
    }

    // 1️⃣ Fetch chart settings
    const [chartRows] = await connection.execute(
      `SELECT * FROM chart_settings WHERE chartNo = ? LIMIT 1`,
      [chartNo]
    );

    if (chartRows.length === 0) {
      return res.status(404).json({ success: false, message: "No chart settings found for given chartNo" });
    }

    const chart = chartRows[0];
    let query = "";
    let params = [];

    // 2️⃣ Decide based on category type
    if (chart.category === "Main Category") {
      if (chart.mainSubId == 0) {
        // 🔹 Fetch all categories (overall summary)
        query = `
          SELECT 
            c.id AS id,
            c.categoryName AS name,
            COALESCE(SUM(e.kWh), 0) AS kWh
          FROM category c
          LEFT JOIN meter_groups mg ON c.id = mg.categoryId
          LEFT JOIN energy_data e ON mg.meterId = e.meterId
          GROUP BY c.id, c.categoryName
          ORDER BY c.categoryName
        `;
      } else {
        // 🔹 Fetch single category
        query = `
          SELECT 
            c.id AS id,
            c.categoryName AS name,
            COALESCE(SUM(e.kWh), 0) AS kWh
          FROM category c
          LEFT JOIN meter_groups mg ON c.id = mg.categoryId
          LEFT JOIN energy_data e ON mg.meterId = e.meterId
          WHERE c.id = ?
          GROUP BY c.id, c.categoryName
        `;
        params.push(chart.mainSubId);
      }
    } 
    else if (chart.category === "Sub Category") {
      if (chart.mainSubId == 0) {
        // 🔹 Fetch all subcategories under main category
        query = `
          SELECT 
            s.id AS id,
            s.subCategoryName AS name,
            COALESCE(SUM(e.kWh), 0) AS kWh
          FROM subcategory s
          LEFT JOIN meter_groups mg ON s.id = mg.subCategoryId
          LEFT JOIN energy_data e ON mg.meterId = e.meterId
          GROUP BY s.id, s.subCategoryName
          ORDER BY s.subCategoryName
        `;
      } else {
        // 🔹 Fetch single subcategory
        query = `
          SELECT 
            s.id AS id,
            s.subCategoryName AS name,
            COALESCE(SUM(e.kWh), 0) AS kWh
          FROM subcategory s
          LEFT JOIN meter_groups mg ON s.id = mg.subCategoryId
          LEFT JOIN energy_data e ON mg.meterId = e.meterId
          WHERE s.id = ?
          GROUP BY s.id, s.subCategoryName
        `;
        params.push(chart.mainSubId);
      }
    } else {
      return res.status(400).json({ success: false, message: "Invalid category type in chart settings" });
    }

    // 3️⃣ Execute query
    const [rows] = await connection.execute(query, params);

    // 4️⃣ Format response
    const data = rows.map((row) => ({
      id: row.id,
      name: row.name,
      kWh: parseFloat(row.kWh).toFixed(2),
      avgConsum: 25000,
    }));

    return res.status(200).json({
      success: true,
      message: "Category/Subcategory energy data fetched successfully",
      chartSettings: chart,
      data,
    });

  } catch (error) {
    console.error("Error fetching category/subcategory energy data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// exports.categoryEnergyByDate = async (req, res) => {
//   try {
//     const { categoryId } = req.body;

//     if (!categoryId) {
//       return res.status(400).json({
//         success: false,
//         message: "categoryId is required",
//       });
//     }


//     const [rows] = await connection.execute(query, [categoryId]);

//     const data = rows.map((row) => ({
//       name: row.name, 
//       fullDate: row.fullDate,
//       uv: 4000,
//       pv: 240,
//       avgConsum: parseFloat(row.avgConsum).toFixed(2),
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Category daily energy data fetched successfully",
//       data,
//     });

exports.categoryEnergyByDate = async (req, res) => {
  try {
    const { categoryId } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "categoryId is required",
      });
    }

    // Fetch actual energy data for the month
    const query = `
      SELECT 
        DATE_FORMAT(e.date, '%d') AS day, 
        DATE_FORMAT(e.date, '%Y-%m-%d') AS fullDate, 
        COALESCE(SUM(e.kWh), 0) AS totalKWh
      FROM meter_groups mg
      JOIN energy_data e ON mg.meterId = e.meterId
      WHERE mg.categoryId = ?
        AND MONTH(e.date) = MONTH(CURDATE())
        AND YEAR(e.date) = YEAR(CURDATE())
      GROUP BY DATE(e.date)
      ORDER BY DATE(e.date);
    `;

    const [rows] = await connection.execute(query, [categoryId]);

    // Map data by day for quick lookup
    const dataMap = {};
    rows.forEach(row => {
      dataMap[row.day] = { fullDate: row.fullDate, avgConsum: parseFloat(row.totalKWh).toFixed(2) };
    });

    // Determine days in current month
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JS months 0-11
    const daysInMonth = new Date(year, month, 0).getDate();

    // Build complete response
    const data = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = i.toString().padStart(2, "0");
      data.push({
        name: dayStr,
        fullDate: dataMap[dayStr]?.fullDate || `${year}-${month.toString().padStart(2, "0")}-${dayStr}`,
        uv: 4000,
        kWh: dataMap[dayStr]?.avgConsum || "0.00",
        avgConsum: 150,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category daily energy data fetched successfully",
      data,
    });

  } catch (error) {
    console.error("Error fetching category energy data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


// exports.categoryHourlyEnergy = async (req, res) => {
//   try {
//     const { categoryId, date } = req.body;

//     if (!categoryId || !date) {
//       return res.status(400).json({
//         success: false,
//         message: "categoryId and date are required",
//       });
//     }

//     // 1️⃣ Get all meterIds for this category
//     const [meters] = await connection.execute(
//       `SELECT meterId FROM meter_groups WHERE categoryId = ?`,
//       [categoryId]
//     );

//     if (meters.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No meters found for this category",
//       });
//     }

//     const meterIds = meters.map((m) => m.meterId);


//     const [rows] = await connection.execute(query, [date, ...meterIds]);

//     // 3️⃣ Convert HR → 1hr, 2hr ... and map to response
//     const hrMapping = {
//       "1AM": "1hr", "2AM": "2hr", "3AM": "3hr", "4AM": "4hr", "5AM": "5hr",
//       "6AM": "6hr", "7AM": "7hr", "8AM": "8hr", "9AM": "9hr", "10AM": "10hr", "11AM": "11hr",
//       "12PM": "12hr", "1PM": "13hr", "2PM": "14hr", "3PM": "15hr", "4PM": "16hr", "5PM": "17hr",
//       "6PM": "18hr", "7PM": "19hr", "8PM": "20hr", "9PM": "21hr", "10PM": "22hr", "11PM": "23hr","12AM": "24hr"
//     };

//     const data = rows.map((row) => ({
//       name: hrMapping[row.HR] || row.HR,
//       uv: 4000,
//       pv: 240,
//       avgConsum: parseFloat(row.totalKWh).toFixed(2),
//     }));

//     return res.status(200).json({
//       success: true,
//       message: "Hourly energy data fetched successfully",
//       data,
//     });


exports.categoryHourlyEnergy = async (req, res) => {
  try {
    const { categoryId, date } = req.body;

    if (!categoryId || !date) {
      return res.status(400).json({
        success: false,
        message: "categoryId and date are required",
      });
    }

    // 1️⃣ Get all meterIds for this category
    const [meters] = await connection.execute(
      `SELECT meterId FROM meter_groups WHERE categoryId = ?`,
      [categoryId]
    );

    if (meters.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No meters found for this category",
      });
    }

    const meterIds = meters.map((m) => m.meterId);
    const placeholders = meterIds.map(() => "?").join(",");

    // 2️⃣ Fetch hourly data for those meterIds on the given date
    const query = `
      SELECT 
        HR,
        SUM(kWh) AS totalKWh
      FROM energy_data
      WHERE DATE(date) = ?
        AND meterId IN (${placeholders})
      GROUP BY HR
    `;

    const [rows] = await connection.execute(query, [date, ...meterIds]);

    // 3️⃣ Define hour order and mapping
    const hrOrder = [
      "1AM","2AM","3AM","4AM","5AM","6AM","7AM","8AM","9AM","10AM","11AM",
      "12PM","1PM","2PM","3PM","4PM","5PM","6PM","7PM","8PM","9PM","10PM","11PM","12AM"
    ];

    const hrMapping = {
      "1AM": "1hr", "2AM": "2hr", "3AM": "3hr", "4AM": "4hr", "5AM": "5hr",
      "6AM": "6hr", "7AM": "7hr", "8AM": "8hr", "9AM": "9hr", "10AM": "10hr", "11AM": "11hr",
      "12PM": "12hr", "1PM": "13hr", "2PM": "14hr", "3PM": "15hr", "4PM": "16hr", "5PM": "17hr",
      "6PM": "18hr", "7PM": "19hr", "8PM": "20hr", "9PM": "21hr", "10PM": "22hr", "11PM": "23hr", "12AM": "24hr"
    };

    // 4️⃣ Build full 24-hour data with defaults = 0
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

    return res.status(200).json({
      success: true,
      message: "Hourly energy data fetched successfully",
      data,
    });

  } catch (err) {
    console.error("Error fetching category hourly energy:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};



// exports.categoryEnergyByMonth = async (req, res) => {
//   try {
//     const { categoryId, month } = req.body;

//     if (!categoryId || !month) {
//       return res.status(400).json({
//         success: false,
//         message: "categoryId and month are required",
//       });
//     }

//     // 1️⃣ Get all meterIds linked to this category
//     const [meterRows] = await connection.execute(
//       `SELECT meterId FROM meter_groups WHERE categoryId = ?`,
//       [categoryId]
//     );

//     if (meterRows.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No meters found for this category",
//       });
//     }

//     const meterIds = meterRows.map((m) => m.meterId);

//     // 2️⃣ Validate month format and prepare table name
//     const [year, monthNum] = month.split("-");
//     const tableName = `energy_data_${year}_${monthNum}`;

//     // 3️⃣ Fetch daily energy data for those meters
//     const query = `
//       SELECT 
//         DATE_FORMAT(date, '%d') AS name,
//         DATE_FORMAT(date, '%Y-%m-%d') AS fullDate,
        
//         SUM(kWh) AS kWh
       
//       FROM ${tableName}
//       WHERE meterId IN (${meterIds.map(() => "?").join(",")})
//       GROUP BY DATE(date)
//       ORDER BY DATE(date)
//     `;

//     const [rows] = await connection.execute(query, meterIds);




exports.categoryEnergyByMonth = async (req, res) => {
  try {
    const { categoryId, month } = req.body;

    if (!categoryId || !month) {
      return res.status(400).json({
        success: false,
        message: "categoryId and month are required",
      });
    }

    // 1️⃣ Get all meterIds linked to this category
    const [meterRows] = await connection.execute(
      `SELECT meterId FROM meter_groups WHERE categoryId = ?`,
      [categoryId]
    );

    if (meterRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No meters found for this category",
      });
    }

    const meterIds = meterRows.map((m) => m.meterId);

    // 2️⃣ Prepare table name from month (YYYY-MM)
    const [year, monthNum] = month.split("-");
    const tableName = `energy_data_${year}_${monthNum}`;

    // 3️⃣ Fetch daily energy data
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

    // 4️⃣ Add hardcoded avgConsum
    const dataWithAvg = rows.map((row) => ({
      ...row,
      avgConsum: 180,
      uv:200, 
    }));

    return res.status(200).json({
      success: true,
      message: "Category daily energy data fetched successfully",
      data: dataWithAvg,
    });
  } catch (error) {
    console.error("Error fetching category energy data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



//dropdown api for settings
//old
// exports.getCategoryData = async (req, res) => {
//   try {
//     const { category } = req.body;

//     if (!category) {
//       return res.status(400).json({
//         success: false,
//         message: "Category type (Main Category or Sub Category) is required",
//       });
//     }


//     const [rows] = await connection.query(query);

exports.getCategoryData = async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category type (Main Category or Sub Category) is required",
      });
    }

    let query = "";
    if (category === "Main Category") {
      query = "SELECT id, categoryName AS name FROM category";
    } else if (category === "Sub Category") {
      query = "SELECT id, subCategoryName AS name FROM subcategory";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid category type. Use 'Main Category' or 'Sub Category'.",
      });
    }

    // Fetch category or subcategory data
    const [rows] = await connection.query(query);

    // Add a fixed "All" option at the top
    const data = [{ id: 0, name: "All" }, ...rows];

    return res.status(200).json({
      success: true,
      type: category,
      data,
    });
  } catch (error) {
    console.error("Error fetching category data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

//old
// exports.saveChartSettings = async (req, res) => {
//   try {
//     const { chartName, type, category, mainSubId } = req.body;

//     if (!chartName || !type || !category || !mainSubId) {
//       return res.status(400).json({
//         success: false,
//         message: "chartName, type, category, and mainSubId are required",
//       });
//     }

//     // 1️⃣ Check if any record already exists
//     const [rows] = await connection.query(`SELECT id FROM chart_settings LIMIT 1`);

//     let query, params, message;


//     const [result] = await connection.query(query, params);


// exports.saveChartSettings = async (req, res) => {
//   try {
//     const { chartNo, chartName, type, category, mainSubId } = req.body;

//     // 1️⃣ Validation
//     if (!chartNo || !chartName || !type || !category || !mainSubId) {
//       return res.status(400).json({
//         success: false,
//         message: "chartNo, chartName, type, category, and mainSubId are required",
//       });
//     }

//     // 2️⃣ Check if chartNo already exists
//     const [rows] = await connection.query(
//       `SELECT id FROM chart_settings WHERE chartNo = ? LIMIT 1`,
//       [chartNo]
//     );

//     let query, params, message;


//     await connection.query(query, params);

exports.saveChartSettings = async (req, res) => {
  try {
    const { chartNo, chartName, type, category, mainSubId } = req.body;

    // 1️⃣ Validation
    if (!chartNo || !chartName || !type || !category || mainSubId === undefined) {
      return res.status(400).json({
        success: false,
        message: "chartNo, chartName, type, category, and mainSubId are required",
      });
    }

    // 2️⃣ Convert "All" → 0
    const resolvedMainSubId = mainSubId === "All" ? 0 : mainSubId;

    // 3️⃣ Check if chartNo already exists
    const [rows] = await connection.query(
      `SELECT id FROM chart_settings WHERE chartNo = ? LIMIT 1`,
      [chartNo]
    );

    let query, params, message;

    if (rows.length === 0) {
      // 4️⃣ Insert new if chartNo not found
      query = `
        INSERT INTO chart_settings (chartNo, chartName, type, category, mainSubId)
        VALUES (?, ?, ?, ?, ?)
      `;
      params = [chartNo, chartName, type, category, resolvedMainSubId];
      message = `Chart settings inserted successfully for ${chartNo}`;
    } else {
      // 5️⃣ Update existing chartNo
      const existingId = rows[0].id;
      query = `
        UPDATE chart_settings
        SET chartName = ?, type = ?, category = ?, mainSubId = ?
        WHERE id = ?
      `;
      params = [chartName, type, category, resolvedMainSubId, existingId];
      message = `Chart settings updated successfully for ${chartNo}`;
    }

    await connection.query(query, params);

    // ✅ Final response
    return res.status(200).json({
      success: true,
      message,
      data: {
        chartNo,
        chartName,
        type,
        category,
        mainSubId: resolvedMainSubId,
      },
    });
  } catch (error) {
    console.error("Error saving chart settings:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
