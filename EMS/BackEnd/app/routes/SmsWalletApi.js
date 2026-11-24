const smsWallet = require('../controllers/SmsWalletController.js');
const router = require("express").Router();

router.get("/summary", smsWallet.summary);
router.get("/purchaseHistory", smsWallet.purchaseHistory);
router.get("/sendLog", smsWallet.sendLog);
router.post("/addPackage", smsWallet.addPackage);

module.exports = router;
