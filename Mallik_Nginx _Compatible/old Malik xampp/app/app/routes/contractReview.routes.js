const router = require("express").Router();
const multer = require("multer");
const upload = require("../middlewares/upload.middleware");
const controller = require("../controllers/contractReview.controller");

// memoryStorage for /import — controller reads req.file.buffer directly
const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// diskStorage via upload util — UUID filename, no spaces
const docUpload = upload("contractReview", "all");

router.get("/template", controller.downloadTemplate);
router.post("/import", memoryUpload.single("file"), controller.importExcel);
router.post("/", docUpload.single("file"), controller.store);
router.get("/search", controller.searchCrNo);
router.get("/getItems", controller.getItems);
router.get("/searchItems", controller.getSuppItm);
router.get("/statutoryReq/:customerId", controller.getStatutoryRequirement);
router.get("/itemsByCustomer/:customerId", controller.getItemsByCustomer);
router.post("/markUsedInSo", controller.markUsedInSo);
router.post("/packingInstructions", controller.getPackingInstructions);
router.put("/:id", docUpload.single("file"), controller.update);
router.delete("/:id", controller.delete);

module.exports = router;

