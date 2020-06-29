const path = require('path')
const User = require('../models/User');
const geoCoder = require('../utils/geocode')
const mongoose = require('mongoose');
const advancedResults = require('../middleware/advancedResults')

const bcrypt = require('bcrypt')


exports.register = (req, res) => {
    console.log(req.body)
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

exports.login = (req, res) => {
    console.log(req.body)
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
                res.status(401).json({ success: 'false', message: 'Wrong Email or password' });
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