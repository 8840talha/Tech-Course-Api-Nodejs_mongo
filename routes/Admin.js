const express = require('express')
const User = require('../models/User')
const advancedResults = require('../middleware/advancedResults')
const { RoleAccess } = require('../middleware/RoleAuth')
const auth = require('../middleware/auth')
const controller = require('../controllers/Admin')
const router = express.Router()



// router.use(auth)
// router.use(RoleAccess('admin'))



router.get('/admin', auth, RoleAccess('admin'), advancedResults(User), controller.getAll_Users)
router.post('/admin', auth, RoleAccess('admin'), controller.create_User);
router.get('/admin/:id', auth, RoleAccess('admin'), controller.get_Single_User)
router.delete('/admin/:id', auth, RoleAccess('admin'), controller.delete_Single_User)
router.put('/admin/:id', auth, RoleAccess('admin'), controller.Update_User)








module.exports = router;