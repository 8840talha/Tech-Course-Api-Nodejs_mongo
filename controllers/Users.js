const path = require('path')
const User = require('../models/User');
const geoCoder = require('../utils/geocode')
const mongoose = require('mongoose');
const advancedResults = require('../middleware/advancedResults')
const sendEmail = require('../utils/sendemail')
const bcrypt = require('bcrypt')
const crypto = require('crypto')


exports.register = (req, res) => {
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({
                success: 'false',
                message: 'Some error occurred'
            })
        } else {
            req.body.password = hash;
            const NewUser = new User(req.body)
            const token = NewUser.getJwtToken();
            const options = {
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000
                ),
                httpOnly: true
            }

            NewUser.save().then(newUser => {
                res.status(200)
                    .cookie('token', token, options)
                    .json({
                        success: true,
                        message: 'User SuccessFully Created',
                        name: newUser.name,
                        token: token
                    })
            }).catch(err => res.status(500).json({ success: false, error: err }))
        }
    })
}

exports.login = (req, res) => {
    if (!req.body.email) {
        return res.status(400).json({ message: 'Please Enter Email ' })
    }
    if (!req.body.password) {
        return res.status(400).json({ message: 'Please Enter Password ' })
    }
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                res.status(401).json({ success: 'false', message: 'Invalid credentials' })
                return 1;
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    res.status(401).json({ success: 'false', message: 'Password wrong ' });
                }
                console.log(result)
                if (result) {
                    const token = user[0].getJwtToken();
                    const options = {
                        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000

                        ),
                        httpOnly: true
                    }
                    res.status(200)
                        .cookie('token', token, options)
                        .json({
                            success: 'true',
                            message: 'Auth Successful',
                            token: token
                        })
                    return 1;
                }
                res.status(401).json({ success: 'false', message: 'Invalid' });
                return 1;
            })

        })
        .catch(err => {
            res.status(500).json({ success: 'false', message: 'Some error occurred' })
            return 1;
        })

}

exports.GetME = (req, res) => {
    res.status(200).json(req.user);
}
exports.updateUserDetails = (req, res) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }
    User.findByIdAndUpdate(req.params.id, fieldsToUpdate,
        { new: true, runValidators: true })
        .exec()
        .then(updatedUser => {

            res.status(200).json({
                success: true,
                message: 'Successfully updated',
                data: updatedUser
            })
        }).catch(err => {
            res.status(500).json({ error: err, success: false, message: 'Some error occurred' })
        })
}

exports.reset = (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(404).json({
                    success: 'false',
                    message: 'User not found'
                })

            }
            bcrypt.compare(req.body.currPassword, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        success: 'false',
                        message: 'Auth fails'
                    });
                }
                if (result) {
                    bcrypt.hash(req.body.newPassword, 10, (error, hash) => {
                        if (error) {
                            return res.status(500).json({
                                success: 'false',
                                message: 'Some error occurred'
                            })
                        } else {
                            user[0].password = hash;
                            user[0].save()
                                .then(resetSuccess => {
                                    //console.log('hiiiiiiiiiiiiiiiiiiiii');
                                    return res.status(200).json({
                                        success: 'true',
                                        message: 'Password changed successfully'
                                    })
                                })
                                .catch(error12 => {
                                    return res.status(500).json({
                                        success: 'false',
                                        message: 'Error in resetting the password'
                                    })
                                })
                        }
                    })
                } else {
                    return res.status(401).json({
                        success: 'false',
                        message: 'Auth faileds'
                    });
                }
            })
        })
        .catch(err1 => {
            res.status(500).json({
                success: 'false',
                message: 'Some error occurred'
            })
            return 1;
        })
}



exports.forgetPassword = (req, res) => {
    User.findOne({ email: req.body.email })
        .exec()
        .then(user => {
            if (!user) {
                return res.status(401).json({ success: 'false', message: 'User With Email Not registere' })
            }
            const resetToken = user.getResetPassToken();
            user.save({ validateBeforeSave: false }).then(u => {
                res.status(200).json({ data: u })
            })

            console.log(resetToken)
            //  Create url for users to reset;
            const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPass/${resetToken}`
            const message = `I am Test Mail :\n\n ${resetUrl}`
            const promise = sendEmail({
                email: user.email,
                subject: 'Pass reset',
                message: message
            }).then(
                res.status(200).json({ success: true, message: 'email sent' })
            ).catch(err => {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpire = undefined;
                user.save({ validateBeforeSave: false });
                res.status(500).json(
                    {
                        success: false,
                        error: err,
                        message: 'message sending failed'
                    })

            })

        }).catch(err => res.status(500).json({
            error: err,
            message: 'Some Error Occured'
        }))
}

exports.resetPassword = (req, res) => {
    const resetPassToken = crypto.createHash('sha256')
        .update(req.params.resettoken).digest('hex');

    User.findOne({
        resetPasswordToken: resetPassToken,
        resetPasswordExpire: { $gt: Date.now() }
    }).exec().then(user => {
        if (!user) {
            return res.status(401).json({ message: 'Invalid token', success: false })
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        // const token = user.getJwtToken();
        user.save().then(u => {

            res.status(200).json({ success: true, data: u })
        }).catch(err => {
            res.status(500).json({ error: err, success: false })
        })


    }).catch(err => {
        res.status(500).json({ error: err, success: false })
    })



}


