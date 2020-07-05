const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');
// const geoCoder = require('../utils/geocode')
const mongoose = require('mongoose');
const advancedResults = require('../middleware/advancedResults')


exports.Get_All_Courses = (req, res) => {
    if (req.params.bootcampId) {
        Course.find({ bootcamp: req.params.bootcampId })
            .exec()
            .then(foundCourses => {
                if (foundCourses.length == 0) {
                    return res.status(404).json({ count: foundCourses.length, success: true, message: 'Not Found Courses', courses: foundCourses })
                }
                res.status(200).json({ count: foundCourses.length, success: true, message: 'Found All Courses', courses: foundCourses })
            })
            .catch(err => err.status(500).json({ error: err }))
    } else {
        advancedResults();
    }
}
exports.Get_Single_Course = (req, res) => {

    Course.findById({ _id: req.params.id })
        .populate({ path: 'bootcamp', select: 'name description' })
        .exec()
        .then(foundCourse => {
            if (!foundCourse) {
                return res.status(404).json({ success: true, message: `Not Found Course with id ${req.params.id} `, course: foundCourse })
            }
            res.status(200).json({ success: true, message: `Found  Course with id ${req.params.id}  `, course: foundCourse })
        })
        .catch(err => res.status(500).json({ error: err.name, message: 'Object Id is Wrong or network issue' }))

}

exports.Add_New_Course = (req, res) => {
    console.log(req.body)
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id;
    Bootcamp.findById(req.params.bootcampId).exec().then(bootcamp => {
        if (!bootcamp) return res.status(404).json({ success: false, message: 'No Bootcamp found to add courses' })

        if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `You dont have access to add a course to ${bootcamp.name}` })
            next()
        }
        const newCourse = new Course(req.body)
        newCourse.save().then(course => {
            res.status(201).json({ success: true, createdCourse: course })
        }).catch(err => {
            res.status(500).json({ success: false, error: err.message })
        })
    })
}
exports.update_Course = (req, res) => {
    Course.findByIdAndUpdate(req.params.id).exec().then(course => {
        if (!course) return res.status(404).json({ success: false, message: `No course found with id ${req.params.id}` })

        if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `You dont have access to update this course  ${course.title}` })
            next()
        }
        Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .exec().then(course => {
                res.status(201).json({ success: true, updatedCourse: course })
            })


    }).catch(err => {
        res.status(500).json({ success: false, error: err.message })
    })
}
exports.delete_Single_Course = (req, res) => {
    Course.findById(req.params.id)
        .exec().then(deletedSingle => {
            if (!deletedSingle) {
                return res.status(404).json({ success: false, message: 'Not Found Entry with this ' + req.params.id + '  to delete' })
            }
            if (deletedSingle.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return res.status(401).json({ success: false, message: `You dont have access to delete this course  ${deletedSingle.title}` })
                next()
            }

            deletedSingle.remove();
            res.status(200).json({ success: true, deletedData: deletedSingle })
        }).catch(err => res.status(500).json({ error: err, success: false, message: 'Wrong Object Id or network issue' }))

}