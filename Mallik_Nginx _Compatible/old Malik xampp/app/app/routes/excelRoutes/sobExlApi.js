const router = require("express").Router();
const sob = require("../../controllers/excel/sobExlController")

// GET
router.get("/template", sob.template);
router.get("/missingCsl", sob.missingCsl);
router.get("/export", sob.sobExport);

// POST
router.post("/import", sob.import);
router.post("/productMap", sob.productMap);

module.exports = router;