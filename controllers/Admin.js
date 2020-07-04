const User = require('../models/User')
const bcrypt = require('bcrypt')


const advancedResults = require('../middleware/advancedResults')
exports.getAll_Users = (req, res) => {
    advancedResults();
}

exports.get_Single_User = (req, res) => {
    User.findById(req.params.id)
        .exec()
        .then(founduser => {
            if (!founduser) {
                return res.status(404).json({ success: true, message: `User ${req.params.id} not found`, })
            }
            res.status(200).json({ success: true, message: 'User found Successfully', foundUser: founduser })
        }).catch(err => {
            res.status(500).json({ success: false, message: 'error Occured', error: err })
        })
}

exports.create_User = (req, res, next) => {
    console.log(req.body)
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            return res.status(401).json({ success: false, message: `error occured in hashing password`, })
        }
        req.body.password = hash;
        const newuser = new User(req.body)
        newuser.save()
            .then(user => {
                res.status(200).json({ success: true, message: 'User Created Successfully', createdUser: user })
            }).catch(err => {
                res.status(500).json({ success: false, message: 'error Occured', error: err })
            })
    })
}
exports.delete_Single_User = (req, res) => {
    User.findByIdAndRemove(req.params.id)
        .exec()
        .then(founduser => {
            if (!founduser) {
                return res.status(404).json({ success: true, message: 'User Not found to delete', })
            }
            res.status(200).json({ success: true, message: 'User deleted Successfully', deletedUser: founduser })
        }).catch(err => {
            res.status(500).json({ success: false, message: 'error Occured', error: err })
        })
}

exports.Update_User = (req, res) => {
    User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .exec()
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).json({ success: true, message: `User with id ${req.params.id}Not found to Update`, })
            }
            res.status(200).json({ success: true, message: 'User updated Successfully', updatedUser: updatedUser })
        }).catch(err => {
            res.status(500).json({ success: false, message: 'error Occured', error: err })
        })
}