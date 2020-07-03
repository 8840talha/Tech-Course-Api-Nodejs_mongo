const express = require('express');
const controllers = require('../controllers/Users')
const router = express.Router();
const auth = require('../middleware/auth')



router.post('/register', controllers.register);
router.post('/login', controllers.login);
router.get('/me', auth, controllers.GetME)
router.put('/update',controllers.reset)
router.post('/forgetPass', controllers.forgetPassword)
router.put('/resetPass/:resettoken', controllers.resetPassword)
router.put('/:id', auth, controllers.updateUserDetails)

module.exports = router;