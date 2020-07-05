var express = require('express');
const advancedResults = require('../middleware/advancedResults')
const auth = require('../middleware/auth')
const { RoleAccess } = require('../middleware/RoleAuth')
const Review = require('../models/Review')
const controller = require('../controllers/Reviews')
const router = express.Router({ mergeParams: true });

router.get('/', advancedResults(Review, {
    path: 'bootcamp',
    select: 'name description'
}), controller.Get_All_Reviews)
router.post('/', auth, RoleAccess('user', 'admin'), controller.Add_Review);
router.get('/:id', controller.Get_Single_Review)
router.put('/:id', auth, RoleAccess('user', 'admin'), controller.update_Review)
router.delete('/:id', auth, RoleAccess('user', 'admin'), controller.delete_Review)


module.exports = router;