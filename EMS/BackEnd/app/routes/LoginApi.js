const login = require('../controllers/LoginLogin.js');
const router = require("express").Router();

router.post("/", login.store);
router.post("/logout", login.logout);


module.exports = router;
