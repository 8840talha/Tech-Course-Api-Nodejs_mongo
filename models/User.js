const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    }, email: {
        type: String,
        unique: true,
        required: [true, ' Please add an email'],
        match: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
            'Please add a Valid email'
        ]
    },
    role: {
        type: String,
        required: [true, 'Please Add a role'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Pleae add a passsword'],
        minlength: 6,
        

    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }

})


UserSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt)

})

UserSchema.methods.getJwtToken = function () {
    const token = jwt.sign({

        email: this.email,
        userId: this._id,

    }, process.env.SECRET
        , {
            expiresIn: "1h"
        }
    )
    return token;
}

module.exports = mongoose.model('User', UserSchema);