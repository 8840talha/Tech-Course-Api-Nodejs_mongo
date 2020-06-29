const express = require('express');
const controllers = require('../controllers/Users')
const router = express.Router();
const auth = require('../middleware/auth')



router.post('/register', controllers.register);
router.post('/login', controllers.login);
router.get('/me', auth, controllers.GetME)
module.exports = router;