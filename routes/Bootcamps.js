var express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const controller = require('../controllers/Bootcamps')


router.get('', controller.bootcamps_get_all)
router.post('', controller.bootcamps_create);
router.delete('', controller.delete_All_Bootcamps);
router.get('/:id', controller.get_Single_BootCamp)
router.delete('/:id', controller.delete_Single_BootCamp)
router.put('/:id', controller.Update_BootCamp)



module.exports = router;