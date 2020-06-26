var express = require('express');
const advancedResults = require('../middleware/advancedResults')
const Bootcamp = require('../models/Bootcamp')
const mongoose = require('mongoose');
const controller = require('../controllers/Bootcamps')
// Include other resource router
const courseRouter = require('./Courses')
const router = express.Router();
// Re-route into other resource
router.use('/:bootcampId/courses', courseRouter);

router.get('', advancedResults(Bootcamp, 'courses'), controller.bootcamps_get_all)
router.post('', controller.bootcamps_create);
router.delete('', controller.delete_All_Bootcamps);
router.get('/:id', controller.get_Single_BootCamp)
router.get('/radius/:zipcode/:distance', controller.get_Bootcamp_By_radius)
router.delete('/:id', controller.delete_Single_BootCamp)
router.put('/:id', controller.Update_BootCamp)
router.put('/:id/photo', controller.Upload_Photo_BootCamp)




module.exports = router;