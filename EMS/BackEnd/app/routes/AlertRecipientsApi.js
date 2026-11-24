const recipients = require('../controllers/AlertRecipientsController.js');
const router = require("express").Router();

router.get("/", recipients.show);
router.post("/", recipients.store);
router.put("/:id", recipients.update);
router.delete("/:id", recipients.delete);

module.exports = router;
