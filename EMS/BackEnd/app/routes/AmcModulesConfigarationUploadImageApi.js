
const UploadImage = require('../controllers/AmcModulesConfigarationUploadImage');
const router = require('express').Router();

router.post('/', UploadImage.store);
router.get('/', UploadImage.show);
router.delete('/:id', UploadImage.delete);
router.put('/:id', UploadImage.update);


module.exports = router;