const router = require("express").Router();
const mrp = require("../controllers/mrpController");
const report = require("../controllers/excel/mrpExlController");
const assembly = require("../controllers/mrpAssemblyController");
const mrpReport = require("../controllers/mrpReportController");

// GET
router.get("/export", report.mrpReport);
router.get("/download", mrpReport.mrpReport);
router.get("/machinePlanReport", report.machinePlanReport);
router.get("/assemblyItemDetails", assembly.getAssemblyItemDetails);
router.get("/assemblyFimDetails", assembly.getAssemblyFimDetails);
router.get("/assemblyStatus", assembly.assemblyUpdateStatus);
router.get("/assemblySobChildItems", assembly.getAssemblySobChildItems);

// POST
router.post("/", mrp.generateMRP);
router.post("/assembly", assembly.assemblySrn);

module.exports = router;