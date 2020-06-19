const Bootcamp = require('../models/Bootcamp');

const mongoose = require('mongoose');

exports.bootcamps_get_all = (req, res) => {
    Bootcamp.find().exec()
        .then(foundBootcamps => {
            res.status(200).json({
                count: foundBootcamps.length,
                success: true,
                bootcamps: foundBootcamps
            })
        })
        .catch(err => err.status(500).json({ error: err }))
}

exports.bootcamps_create = (req, res) => {
    console.log(req.body)
    // Async await method
    // try {
    //     const bootcamp = await Bootcamp.create(req.body);

    //     res.status(201).json({
    //         success: true,
    //         data: bootcamp
    //     })
    // } catch (error) {
    //     res.status(400).json({
    //         success: true,
    //         error: error
    //     })
    // }

    const newBC = new Bootcamp(req.body)
    newBC.save().then(bC => {
        res.status(201).json({
            success: true,
            data: bC
        })
    }).catch(err => {
        if (err.code == 11000) res.status(400).json({ error: err.name, message: `Bootcamp With name ${req.body.name} already exists` })
        else res.status(500).json({ error: err.message })

    })

}
exports.delete_All_Bootcamps = (req, res) => {
    Bootcamp.deleteMany()
        .exec()
        .then(deleteBootcamps => {
            if (!deleteBootcamps) {
                return res.status(404).json({
                    success: true,
                    message: 'Nothing to delete ,no enteries to delete',
                    deleteBootcamps: {}
                })
            }
            res.status(200).json({
                success: true,
                message: 'deleted all bootcamps successfully',
                deleteBootcamps: deleteBootcamps
            })
        }).catch(err => res.status(500).json({ error: err }))
}
exports.get_Single_BootCamp = (req, res, next) => {
    Bootcamp.findById(req.params.id)
        .exec()
        .then(SingleBootCamp => {
            if (!SingleBootCamp) {
                return res.status(404).json({
                    success: false,
                    data: {},
                    message: 'Not Found Entry with this id '
                })
            }
            res.status(200).json({
                success: true,
                data: SingleBootCamp
            })
        }).catch(err => res.status(400).json({ error: err, success: false, message: 'Wrong Object Id' })
            // next(err)
        )
}

exports.delete_Single_BootCamp = (req, res) => {
    Bootcamp.findByIdAndRemove(req.params.id)
        .exec().then(deletedSingle => {
            if (!deletedSingle) {
                return res.status(404).json({
                    success: false,
                    message: 'Not Found Entry with this id  to delete'
                })
            }
            res.status(200).json({
                success: true,
                deletedData: deletedSingle
            })
        }).catch(err => res.status(500).json({ error: err, success: false, message: 'Wrong Object Id or network issue' }))

}


exports.Update_BootCamp = (req, res) => {
    Bootcamp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .exec()
        .then(updatedSingle => {
            if (!updatedSingle) {
                return res.status(404).json({
                    success: false,
                    message: 'Not Found Entry with this id  to update'
                })
            }
            res.status(200).json({
                success: true,
                message: 'SuccessFully Updated',
                data: updatedSingle
            })
        }).catch(err => res.status(500).json({ error: err, success: false, message: 'Wrong Object Id or network issue' }))

}