const { connection } = require('./app/config/dbSql2');

async function run() {
  try {
    const [rows] = await connection.query(`
      SELECT DISTINCT meterType FROM meters
    `);
    console.log("METER TYPES IN METERS TABLE:", rows);

    const [meters] = await connection.query(`
      SELECT id, displayName, meterType FROM meters
      WHERE meterType LIKE '%incomer%' OR meterType LIKE '%Electric board%'
    `);
    console.log("INCOMER METERS:", meters);

    const [columns] = await connection.query(`
      DESCRIBE chart_gauges
    `);
    console.log("CHART_GAUGES COLUMNS:", columns);

    const [gauges] = await connection.query(`
      SELECT * FROM chart_gauges
    `);
    console.log("CHART_GAUGES CURRENT ROWS:", gauges);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
