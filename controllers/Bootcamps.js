const Bootcamp = require('../models/Bootcamp');
const geoCoder = require('../utils/geocode')
const mongoose = require('mongoose');

exports.bootcamps_get_all = (req, res) => {
    let query;
    let reqQuery = { ...req.query }



    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    let find = JSON.parse(queryStr)

    query = Bootcamp.find(find).populate('courses')

    // Select Fields
    if (req.query.select) {
        // const fields = req.query.select.split(',').join(' ');
        query = query.select(req.query.select);
    }

    // Sort
    if (req.query.sort) {
        // const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(req.query.sort);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    var page = parseInt(req.query.page, 10) || 1;
    var limit = parseInt(req.query.limit, 10) || 25;
    var startIndex = (page - 1) * limit;
    var endIndex = page * limit;
    var Pagination = {}
    Bootcamp.countDocuments().then(total => {
        if (endIndex < total) {
            Pagination.next = {
                page: page + 1,
                limit
            }
        }
        if (startIndex > 0) {
            Pagination.prev = {
                page: page - 1,
                limit
            }
        }
    })




    query = query.skip(startIndex).limit(limit)



    query.then(foundBootcamps => {
        res.status(200).json({
            count: foundBootcamps.length,
            success: true,
            Pagination,
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