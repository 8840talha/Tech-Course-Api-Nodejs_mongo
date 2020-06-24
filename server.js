
var express = require('express');
var dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

var app = express();


const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorHandler = require('./middleware/error')
const mongoose = require('mongoose');
const fileupload = require('express-fileupload')


const bootcamps = require('./routes/Bootcamps')
const courses = require('./routes/Courses')


const Url = 'mongodb+srv://dev:dev1234@cluster0-gakn1.mongodb.net/devDB'
mongoose.connect(Url, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false, useCreateIndex: true
}, () => {
    console.log('connected')
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('uploads'))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Acces-Control-Allow-Headers',
        'Origin,X-Requested-With,Content-Type,Accept,Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header('Acces-Control-Allow-Methods',
            'PUT,PATCH,POST,DELETE,GET'
        )
        return res.status(200).json({});
    }
    next();

})

app.use(morgan('dev'));
app.use(fileupload())
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use(errorHandler)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT} `)
})