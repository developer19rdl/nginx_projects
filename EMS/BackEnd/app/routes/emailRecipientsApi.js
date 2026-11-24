const emailRecipients = require("../controllers/EmailRecipientsController.js");
const router = require("express").Router();

router.get("/", emailRecipients.show);
router.post("/", emailRecipients.store);
router.delete("/:id", emailRecipients.delete);

module.exports = router;
