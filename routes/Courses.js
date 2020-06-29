var express = require('express');
const advancedResults = require('../middleware/advancedResults')
const auth = require('../middleware/auth')
const { RoleAccess } = require('../middleware/RoleAuth')
const Course = require('../models/Course')
const controller = require('../controllers/Courses')
const router = express.Router({ mergeParams: true });

router.get('/', advancedResults(Course, {
    path: 'bootcamp',
    select: 'name description'
}), controller.Get_All_Courses)
router.post('/', auth, RoleAccess('publisher', 'admin'), controller.Add_New_Course);
router.get('/:id', controller.Get_Single_Course)
router.put('/:id', auth, RoleAccess('publisher', 'admin'), controller.update_Course)
router.delete('/:id', auth, RoleAccess('publisher', 'admin'), controller.delete_Single_Course)


module.exports = router;