const assignRole = require('../controllers/AssignRoleController.js');
const router = require("express").Router();

router.get("/", assignRole.show);
router.get("/byRole/:roleName", assignRole.showByRole);
router.post("/", assignRole.store);
router.put("/:id", assignRole.update);
router.delete("/:id", assignRole.delete);

module.exports = router;
