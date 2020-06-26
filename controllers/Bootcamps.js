const path = require('path')
const Bootcamp = require('../models/Bootcamp');
const geoCoder = require('../utils/geocode')
const mongoose = require('mongoose');
const advancedResults = require('../middleware/advancedResults')
exports.bootcamps_get_all = (req, res) => {
    advancedResults();
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
        res.status(201).json({ success: true, data: bC })
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
                return res.status(404).json({ success: true, message: 'Nothing to delete ,no enteries to delete', deleteBootcamps: {} })
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
    Bootcamp.findById(req.params.id)
        .exec().then(deletedSingle => {
            if (!deletedSingle) {
                return res.status(404).json({
                    success: false,
                    message: 'Not Found Entry with this id  to delete'
                })
            }

            deletedSingle.remove();
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

exports.get_Bootcamp_By_radius = async (req, res) => {
    const { zipcode, distance } = req.params;
    const radius = distance / 3963

    const loc = await geoCoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude
    Bootcamp.find(
        {
            location: {
                $geoWithin: { $centerSphere: [[lng, lat], radius] }
            }
        }
    ).exec()
        .then(result => {
            if (result.length == 0) {
                return res.status(404).json({
                    count: result.length,
                    bootcamps: result,
                    success: true,
                    message: ` Not Found  bootcamps in ${distance} miles`

                })
            }
            res.status(200).json({
                count: result.length,
                bootcamps: result,
                success: true,
                message: `Found All bootcamps in ${distance} miles`

            })
        }).catch(err => res.status(500).json({ success: false, message: 'Wrong Zipcode OR other network issue', error: err }))



}


exports.Upload_Photo_BootCamp = (req, res) => {
    Bootcamp.findById(req.params.id)
        .exec()
        .then(bootcamp => {
            if (!bootcamp) { return res.status(404).json({ success: false, message: 'Not Found Entry with this id  to upload a photo' }) }
            if (!req.files) { return res.status(400).json({ success: false, message: 'Please provide a file ' }) }
            const file = req.files.file;
            if (!file.mimetype.startsWith('image')) { return res.status(400).json({ success: false, message: 'Please provide a image file' }) }
            file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
            file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, function (err) {
                if (err) { return res.status(500).json({ success: false, message: 'problem uploading file file' }) }
                Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })
                    .exec()
                    .then(found => {
                        res.status(200).json({ success: true, message: 'SuccessFully Updated', data: file.name })
                    })
            })
        }).catch(err => res.status(500).json({ error: err, success: false, message: 'Wrong Object Id or network issue' }))
}