var express = require('express');

const controller = require('../controllers/Courses')
const router = express.Router({ mergeParams: true });

router.get('/', controller.Get_All_Courses)
router.post('/', controller.Add_New_Course);
router.get('/:id', controller.Get_Single_Course)
router.put('/:id', controller.update_Course)
router.delete('/:id', controller.delete_Single_Course)


module.exports = router;