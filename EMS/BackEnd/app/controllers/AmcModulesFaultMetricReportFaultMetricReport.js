const moment = require('moment');
const { connection } = require('../config/dbSql2');
const utility = require('../utility/utilityFunction');
const bcrypt = require('bcrypt');
const { start } = require('pm2');


exports.getMachineMetrics = async (req, res) => {
  const year = req.body.year;
  const month = req.body.month;

  const startDate = moment(`${year}-${month}-01`).format('YYYY-MM-DD');
  const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
  let results = [];

  const convertSecondsToHHMMSS = (seconds) => {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  try {
    const machineQuery = `
      SELECT DISTINCT m.machine_name 
      FROM machines m
      INNER JOIN failuremetrictarget f ON m.id = f.Machine
      INNER JOIN oee_shift_data osd ON f.Machine = osd.machineId
      WHERE osd.date BETWEEN ? AND ?;
    `;
    const [machineResults] = await connection.execute(machineQuery, [startDate, endDate]);

    const machines = machineResults.map(machine => machine.machine_name);

    let checkDowntimePromises = machines.map(async (machine) => {
      let query = `
          SELECT
            SUM(osd.downTime) AS totalDownTime
          FROM
            oee_shift_data osd
          INNER JOIN
            machines m ON m.id = osd.machineId
          WHERE
            m.machine_name = ?
            AND osd.date BETWEEN ? AND ?
        `;
      const [result] = await connection.execute(query, [machine, startDate, endDate]);
      return { machine, totalDownTime: result[0].totalDownTime };
    });

    const downtimeResults = await Promise.all(checkDowntimePromises);

    let filteredMachines = downtimeResults.filter(result => result.totalDownTime > 0);

    let detailedQueryPromises = filteredMachines.map(async ({ machine }) => {
      let query = `
          SELECT
            osd.id,
            osd.downTime,
            f.mtbfTarget,
            f.mttfTarget,
            f.mttrTarget,
            osd.date
          FROM
            oee_shift_data osd
          INNER JOIN
            failuremetrictarget f ON f.Machine = osd.machineId
          INNER JOIN
            machines m ON m.id = f.Machine
          WHERE
            m.machine_name = ?
            AND osd.date BETWEEN ? AND ?
        `;
      const [result] = await connection.execute(query, [machine, startDate, endDate]);
      return { machine, data: result };
    });

    const detailedValues = await Promise.all(detailedQueryPromises);

    detailedValues.forEach(({ machine, data }) => {
      let totalDownTime = data.reduce((acc, entry) => acc + entry.downTime, 0);

      if (totalDownTime === 0) {
        results.push({
          machine,
          message: "No data found"
        });
        return;
      }

      let filteredData = data.filter(entry => entry.downTime > 0);
      let totalOccurrences = filteredData.length;
      let totalWorkingHoursInSeconds = moment(endDate).diff(moment(startDate), 'days') * 24 * 3600;

      let MTTR = totalOccurrences ? (totalDownTime / totalOccurrences) : 0;
      let MTBFSeconds = totalOccurrences ? (totalWorkingHoursInSeconds / totalOccurrences) : 0;
      let MTBF = convertSecondsToHHMMSS(MTBFSeconds);

      let MTTF;
      if (totalOccurrences > 0) {
        let MTTFSeconds = Math.max(((totalWorkingHoursInSeconds - totalDownTime) / totalOccurrences), 0);
        MTTF = convertSecondsToHHMMSS(MTTFSeconds);
      } else {
        MTTF = '00:00';
      }

      const target = data.length > 0 ? data[0] : {};
      let MTTRTarget = target.mttrTarget ? moment.utc().startOf('day').add(target.mttrTarget, 'minutes').format('HH:mm:ss') : '00:00:00';
      let MTBFTarget = target.mtbfTarget ? moment.utc().startOf('day').add(target.mtbfTarget, 'minutes').format('HH:mm:ss') : '00:00:00';
      let MTTFTarget = target.mttfTarget ? moment.utc().startOf('day').add(target.mttfTarget, 'minutes').format('HH:mm:ss') : '00:00:00';

      let downtimeDetails = data.filter(entry => entry.downTime > 0).map(entry => ({
        downTime: entry.downTime,
        date: entry.date
      }));

      let result = {};
      if (target.id) result.id = target.id;
      if (machine) result.machine = machine;
      if (totalDownTime) result.totalDownTime = totalDownTime;
      if (totalOccurrences) result.totalOccurrences = totalOccurrences;
      if (MTTR) result.MTTR = moment.utc(MTTR * 1000).format('HH:mm:ss');
      if (MTBF) result.MTBF = MTBF;
      if (MTTF) result.MTTF = MTTF;
      if (MTTRTarget) result.MTTRTarget = MTTRTarget;
      if (MTTFTarget) result.MTTFTarget = MTTFTarget;
      if (MTBFTarget) result.MTBFTarget = MTBFTarget;
      if (target.date) result.date = target.date;
      if (downtimeDetails.length) result.downtimeDetails = downtimeDetails;

      if (Object.keys(result).length > 0) {
        results.push(result);
      }
    });

    res.json({ results });
  } catch (err) {
    console.error("Error in processing:", err);
    res.status(500).json({ error: err.message });
  }
};



exports.getMachineData = async (req, res) => {
  const year = req.body.year;
  const month = req.body.month;
  const machine = req.body.machine;

  const startDate = moment(`${year}-${month}-01`).format('YYYY-MM-DD');
  const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
  let results = [];

  const convertSecondsToHHMMSS = (seconds) => {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  try {
    let query = `
      SELECT 
        osd.id,
        osd.downTime,
        f.mtbfTarget,
        f.mttfTarget,
        f.mttrTarget,
        osd.date
      FROM 
        oee_shift_data osd
      INNER JOIN 
        failuremetrictarget f ON f.Machine = osd.machineId  
      INNER JOIN 
        machines m ON m.id = f.Machine 
      WHERE 
        m.id = ? 
        AND osd.date BETWEEN ? AND ?
    `;

    const [data] = await connection.execute(query, [machine, startDate, endDate]);

    const targetQuery = `
      SELECT
        a.id, f.mtbfTarget, f.mttrTarget, f.mttfTarget
      FROM
        failuremetrictarget f
      INNER JOIN
        machines a ON a.id = f.Machine
      WHERE
        a.id = ?
    `;

    const [targetRows] = await connection.execute(targetQuery, [machine]);
    const targets = targetRows[0];

    let filteredData = data.filter(entry => entry.downTime > 0);
    let totalOccurrences = filteredData.length;
    let totalDownTime = filteredData.reduce((acc, entry) => acc + entry.downTime, 0);
    let totalWorkingHoursInSeconds = moment(endDate).diff(moment(startDate), 'days') * 24 * 3600;

    let MTTR = totalOccurrences ? (totalDownTime / totalOccurrences) : 0;
    let MTBFSeconds = totalOccurrences ? (totalWorkingHoursInSeconds / totalOccurrences) : 0;
    let MTBF = convertSecondsToHHMMSS(MTBFSeconds);

    let MTTF;
    if (totalOccurrences > 0) {
      let MTTFSeconds = Math.max(((totalWorkingHoursInSeconds - totalDownTime) / totalOccurrences), 0);
      MTTF = convertSecondsToHHMMSS(MTTFSeconds);
    } else {
      MTTF = '00:00';
    }

    let MTTRTarget = targets ? moment.utc().startOf('day').add(targets.mttrTarget, 'minutes').format('HH:mm:ss') : '00:00:00';
    let MTBFTarget = targets ? moment.utc().startOf('day').add(targets.mtbfTarget, 'minutes').format('HH:mm:ss') : '00:00:00';
    let MTTFTarget = targets ? moment.utc().startOf('day').add(targets.mttfTarget, 'minutes').format('HH:mm:ss') : '00:00:00';

    let downtimeDetails = data.filter(entry => entry.downTime > 0).map(entry => ({
      downTime: entry.downTime,
      date: entry.date
    }));

    let result = {
      machine: machine,
      totalDownTime: totalDownTime,
      totalOccurrences: totalOccurrences,
      MTTR: moment.utc(MTTR * 1000).format('HH:mm:ss'),
      MTBF: MTBF,
      MTTF: MTTF,
      MTTRTarget: MTTRTarget,
      MTTFTarget: MTTFTarget,
      MTBFTarget: MTBFTarget,
      downtimeDetails: downtimeDetails
    };

    if (targets) {
      result.id = targets.id;
      result.date = targets.date;
    }

    results.push(result);

    res.json({ results });
  } catch (err) {
    console.error("Error in processing:", err);
    res.status(500).json({ error: err.message });
  }
};



exports.getMachinesgraph = async (req, res) => {
  const year = req.body.year;
  const month = req.body.month;
  const filterType = req.body.filterType;

  const startDate = moment(`${year}-${month}-01`).format('YYYY-MM-DD');
  const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
  let results = [];

  const convertSecondsToHHMMSS = (seconds) => {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  try {
    const machineQuery = `
      SELECT DISTINCT ast.machine_name 
      FROM machines ast
      INNER JOIN failuremetrictarget m ON ast.id = m.Machine
      INNER JOIN oee_shift_data osd ON m.Machine = osd.machineId
      WHERE osd.date BETWEEN ? AND ?;
    `;
    const [machineResults] = await connection.execute(machineQuery, [startDate, endDate]);

    const machines = machineResults.map(machine => machine.machine_name);

    let promises = machines.map(async (machine) => {
      let query = `
          SELECT
              ast.id,
              ast.machine_name,
              osd.downTime,
              m.mtbfTarget,
              m.mttfTarget,
              m.mttrTarget,
              osd.date
          FROM
              oee_shift_data osd
          INNER JOIN
              failuremetrictarget m ON osd.machineId = m.Machine
          INNER JOIN
              machines ast ON osd.machineId = ast.id
          WHERE
              ast.machine_name = ? AND osd.date BETWEEN ? AND ?
          GROUP BY
              osd.id
        `;
      const [result] = await connection.execute(query, [machine, startDate, endDate]);
      return { machine, data: result };
    });

    const values = await Promise.all(promises);

    values.forEach(({ machine, data }) => {
      if (data.length === 0) {
        return;
      }

      let totalOccurrences = data.length;
      let totalDownTime = data.reduce((acc, entry) => acc + entry.downTime, 0);
      let totalWorkingHoursInSeconds = moment(endDate).diff(moment(startDate), 'days') * 24 * 3600;

      let MTTR = totalOccurrences ? (totalDownTime / totalOccurrences) : 0;
      let MTBFSeconds = totalOccurrences ? (totalWorkingHoursInSeconds / totalOccurrences) : 0;
      let MTBF = convertSecondsToHHMMSS(MTBFSeconds);

      let MTTF;
      if (totalOccurrences > 0) {
        let MTTFSeconds = Math.max(((totalWorkingHoursInSeconds - totalDownTime) / totalOccurrences), 0);
        MTTF = convertSecondsToHHMMSS(MTTFSeconds);
      } else {
        MTTF = '00:00';
      }

      const target = data.length > 0 ? data[0] : {};
      let MTTRTarget = target.mttrTarget ? moment.utc().startOf('day').add(target.mttrTarget, 'minutes').format('HH:mm:ss') : '00:00:00';
      let MTBFTarget = target.mtbfTarget ? moment.utc().startOf('day').add(target.mtbfTarget, 'minutes').format('HH:mm:ss') : '00:00:00';
      let MTTFTarget = target.mttfTarget ? moment.utc().startOf('day').add(target.mttfTarget, 'minutes').format('HH:mm:ss') : '00:00:00';

      let result = { machine, date: target.date };

      if (filterType === 'mttr') {
        result.mttr = moment.utc(MTTR * 1000).format('HH:mm:ss');
        result.MTTRTarget = MTTRTarget;
      } else if (filterType === 'mtbf') {
        result.mtbf = MTBF;
        result.MTBFTarget = MTBFTarget;
      } else if (filterType === 'mttf') {
        result.mttf = MTTF;
        result.MTTFTarget = MTTFTarget;
      }

      results.push(result);
    });

    res.json({ results });
  } catch (err) {
    console.error("Error in processing:", err);
    res.status(500).json({ error: err.message });
  }
};


// exports.getMachinesGraphCalc = async (req, res) => {
//   const { year, month, machine, filterType } = req.body;

//   const startDate = moment(`${year}-${month}-01`).format('YYYY-MM-DD');
//   const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
//   let results = [];

//   const convertSecondsToHHMMSS = (seconds) => {
//     let hours = Math.floor(seconds / 3600);
//     let minutes = Math.floor((seconds % 3600) / 60);
//     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
//   };



//     let totalOccurrences = oeeRows.length;
//     let totalDownTime = oeeRows.reduce((acc, entry) => acc + entry.downTime, 0);
//     let totalWorkingHoursInSeconds = moment(endDate).diff(moment(startDate), 'days') * 24 * 3600;

//     let MTTR = totalOccurrences ? (totalDownTime / totalOccurrences) : 0;
//     let MTBFSeconds = totalOccurrences ? (totalWorkingHoursInSeconds / totalOccurrences) : 0;
//     let MTBF = convertSecondsToHHMMSS(MTBFSeconds);

//     let MTTF;
//     if (totalOccurrences > 0) {
//       let MTTFSeconds = Math.max(((totalWorkingHoursInSeconds - totalDownTime) / totalOccurrences), 0);
//       MTTF = convertSecondsToHHMMSS(MTTFSeconds);
//     } else {
//       MTTF = '00:00';
//     }

//     const target = oeeRows.length > 0 ? oeeRows[0] : {};
//     let MTTRTarget = target.mttrTarget ? moment.utc().startOf('day').add(target.mttrTarget, 'minutes').format('HH:mm:ss') : '00:00:00';
//     let MTBFTarget = target.mtbfTarget ? moment.utc().startOf('day').add(target.mtbfTarget, 'minutes').format('HH:mm:ss') : '00:00:00';
//     let MTTFTarget = target.mttfTarget ? moment.utc().startOf('day').add(target.mttfTarget, 'minutes').format('HH:mm:ss') : '00:00:00';

//     let result = { machine, date: target.date };


//     results.push(result);

//     res.json({ results });
//   } catch (err) {
//     console.error("Error in processing:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

exports.getMachinesGraphCalc = async (req, res) => {
  const { year, month, machine, filterType } = req.body;

  const startDate = moment(`${year}-${month}-01`).format('YYYY-MM-DD');
  const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
  let results = [];

  const convertSecondsToHHMMSS = (seconds) => {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  try {
    const machineQuery = `
      SELECT * FROM machines ast
      INNER JOIN failuremetrictarget m ON ast.id = m.Machine
      INNER JOIN oee_shift_data osd ON m.machine = osd.machineId
      WHERE ast.id = ? AND date(osd.date) >= ? AND date(osd.date) <= ?
    `;
    const [rows] = await connection.execute(machineQuery, [machine, startDate, endDate]);

    let query = `
      SELECT
          ast.id,
          ast.machine_name,
          osd.downTime,
          m.mtbfTarget,
          m.mttfTarget,
          m.mttrTarget,
          osd.date
      FROM
          oee_shift_data osd
      INNER JOIN
          failuremetrictarget m ON osd.machineId = m.Machine
      INNER JOIN
          machines ast ON osd.machineId = ast.id
      WHERE
        ast.id = ? AND date(osd.date) >= ? AND date(osd.date) <= ?
      GROUP BY
        osd.id
    `;
    const [oeeRows] = await connection.execute(query, [machine, startDate, endDate]);

    let totalOccurrences = oeeRows.length;
    let totalDownTime = oeeRows.reduce((acc, entry) => acc + entry.downTime, 0);
    let totalWorkingHoursInSeconds = moment(endDate).diff(moment(startDate), 'days') * 24 * 3600;

    let MTTR = totalOccurrences ? (totalDownTime / totalOccurrences) : 0;
    let MTBFSeconds = totalOccurrences ? (totalWorkingHoursInSeconds / totalOccurrences) : 0;
    let MTBF = convertSecondsToHHMMSS(MTBFSeconds);

    let MTTF;
    if (totalOccurrences > 0) {
      let MTTFSeconds = Math.max(((totalWorkingHoursInSeconds - totalDownTime) / totalOccurrences), 0);
      MTTF = convertSecondsToHHMMSS(MTTFSeconds);
    } else {
      MTTF = '00:00';
    }

    const target = oeeRows.length > 0 ? oeeRows[0] : {};
    let MTTRTarget = target.mttrTarget ? moment.utc().startOf('day').add(target.mttrTarget, 'minutes').format('HH:mm:ss') : '00:00:00';
    let MTBFTarget = target.mtbfTarget ? moment.utc().startOf('day').add(target.mtbfTarget, 'minutes').format('HH:mm:ss') : '00:00:00';
    let MTTFTarget = target.mttfTarget ? moment.utc().startOf('day').add(target.mttfTarget, 'minutes').format('HH:mm:ss') : '00:00:00';

    let result = { machine, machine_name: target.machine_name, date: target.date };

    if (filterType === 'mttr') {
      result.mttr = moment.utc(MTTR * 1000).format('HH:mm:ss');
      result.MTTRTarget = MTTRTarget;
    } else if (filterType === 'mtbf') {
      result.mtbf = MTBF;
      result.MTBFTarget = MTBFTarget;
    } else if (filterType === 'mttf') {
      result.mttf = MTTF;
      result.MTTFTarget = MTTFTarget;
    }

    results.push(result);

    res.json({ results });
  } catch (err) {
    console.error("Error in processing:", err);
    res.status(500).json({ error: err.message });
  }
};




exports.getsinglemachinegraph = async (req, res) => {
  const year = req.body.year;
  const month = req.body.month;
  const machine = req.body.machine;
  console.log("req.body==", req.body);
  const startDate = moment(`${year}-${month}-01`, 'YYYY-MMM-DD').format('YYYY-MM-DD');
  const endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
  let results = [];

  const convertSecondsToHHMMSS = (seconds) => {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const roundOff = (value, decimals = 2) => {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  };
  try {
    let query = `
    SELECT
      osd.id,
      ma.id,
      osd.downTime,
      m.mtbfTarget,
      m.mttfTarget,
      m.mttrTarget,
      osd.date
    FROM
      oee_shift_data osd
    INNER JOIN
      failuremetrictarget m
    ON
      m.machine = osd.machineId
    INNER JOIN
    machines ma
    ON
      ma.id =  m.machine 
    WHERE
      ma.id = ?
      AND osd.date BETWEEN ? AND ?
  `;
    const [data] = await connection.execute(query, [machine, startDate, endDate]);
    console.log("machine==", machine)
    const targetQuery = ` SELECT ma.id,f.mtbfTarget, f.mttrTarget, f.mttfTarget FROM failuremetrictarget f
                         INNER JOIN   machines ma  on ma.id=f.Machine
    WHERE ma.id = ?`;
    const target = data.length > 0 ? data[0] : {};
    const [targetResult] = await connection.execute(targetQuery, [machine]);
    console.log("result", targetResult)
    const targets = targetResult[0];
    let filteredData = data.filter(entry => entry.downTime > 0);
    let totalOccurrences = filteredData.length;
    let totalDownTime = filteredData.reduce((acc, entry) => acc + entry.downTime, 0);
    let totalWorkingHoursInSeconds = moment(endDate).diff(moment(startDate), 'days') * 24 * 3600;
    let MTTR = totalOccurrences ? (totalDownTime / totalOccurrences) : 0;
    let MTBFSeconds = totalOccurrences ? (totalWorkingHoursInSeconds / totalOccurrences) : 0;
    let MTBF = convertSecondsToHHMMSS(MTBFSeconds);
    let MTTF;
    if (totalOccurrences > 0) {
      let MTTFSeconds = Math.max(((totalWorkingHoursInSeconds - totalDownTime) / totalOccurrences), 0);
      MTTF = convertSecondsToHHMMSS(MTTFSeconds);
    } else {
      MTTF = '00:00'; // Or any default value you prefer
    }
    let MTTRTarget = targets ? moment.utc().startOf('day').add(targets.mttrTarget, 'minutes').format('HH:mm:ss') : '00:00:00';
    let MTBFTarget = targets ? moment.utc().startOf('day').add(targets.mtbfTarget, 'minutes').format('HH:mm:ss') : '00:00:00';
    let MTTFTarget = targets ? moment.utc().startOf('day').add(targets.mttfTarget, 'minutes').format('HH:mm:ss') : '00:00:00';
    console.log("targetId==", targets)
    let downtimeDetails = data
      .filter(entry => entry.downTime > 0)
      .map(entry => ({
        downTime: entry.downTime,
        date: entry.date
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date in ascending order

    let result = {
      id: targets.id,
      machine: machine,
      downtimeDetails: downtimeDetails
    };

    results.push(result);
    res.json({ results });
  } catch (err) {
    console.error("Error in processing:", err);
    res.status(500).json({ error: err.message });
  }
};



exports.showmachinename = async (req, res) => {
  const { id } = req.params
  try {
    const showQuery = `SELECT DISTINCT m.machine_name,m.id
      FROM machines m
      INNER JOIN failuremetrictarget f ON m.id = f.Machine
      INNER JOIN oee_shift_data osd ON f.Machine = osd.machineId
                        
                           `;
    const [rows] = await connection.execute(showQuery);

    if (rows.length > 0) {
      return res.status(200).json({ success: true, data: rows });
    } else {
      return res.status(404).json({ success: false, message: "Data not found" });
    }

  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message || 'An error occurred' });
  }
};
