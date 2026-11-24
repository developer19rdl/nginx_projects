const router = require("express").Router();
const csl = require("../../controllers/excel/cslExlController")
const upload = require("../../middlewares/upload.middleware");

router.get("/template", csl.template);
router.get("/contractNoTemplate", csl.contractNoTemplate);
router.get("/export", csl.cslExport);
router.post("/import", csl.import);
router.post("/contractNoList", upload("csl", "document").single("file"), csl.contractNoList);

module.exports = router;