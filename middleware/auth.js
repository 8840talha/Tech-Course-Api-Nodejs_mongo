const jwt = require('jsonwebtoken')
const User = require('../models/User')
module.exports = async (req, res, next) => {

    try {
        const token = req.get('Authorization').split(' ')[1];
        const decoded = jwt.verify(token, process.env.SECRET)
        console.log(decoded)
        req.user = await User.findById(decoded.userId)
        console.log(req.user)
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Auth failed",

        })
    }




}

