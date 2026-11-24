const AuthLogin = require('../controllers/AuthController.js');
const router = require("express").Router();

router.post("/", AuthLogin.login);
router.post("/refreshToken", AuthLogin.refreshToken);
// router.post("/logout", login.logout);


module.exports = router;
