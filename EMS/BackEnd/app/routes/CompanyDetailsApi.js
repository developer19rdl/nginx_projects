const cmpDet = require('../controllers/CompanyDetailsController.js');
const router = require("express").Router();

router.get("/", cmpDet.companyDetails);
router.post("/LogoUpload", cmpDet.LogoUpload);
router.post("/VideoUpload", cmpDet.videoUpload.single('video'), cmpDet.VideoUpload);

module.exports = router;