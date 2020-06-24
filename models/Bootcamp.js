var mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocode');
var BootcampSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Please Add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name must be shorter than 50 chars']

    },

    slug: String,

    description: {
        type: String,
        required: [true, 'Please Add a description'],
        maxlength: [500, 'Description must be shorter than 500 chars']
    },
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use A valid Url with Http or Https'
        ]
    },
    phone: {
        type: String,
        maxlength: [20, 'number cannot be more than 20']
    },
    email: {
        type: String,
        unique: true,
        required: [true, ' Please add an email'],
        match: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
            'Please add a Valid email'
        ]
    },
    address: {
        type: String,
        required: [true, 'Please add an address']

    },
    location: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be atleast one'],
        max: [10, 'Rating must be between 1 to 10'],

    },
    averageCost: Number,
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


BootcampSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})

// GEOCODE AND CREATE LOCATION FIELD
BootcampSchema.pre('save', async function (next) {
    const loc = await geocoder.geocode(this.address)
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode,
    }
    // Do not save Address in Db 
    this.address = undefined;
    next();
})
// Delete courses also when a bootcamp is deleted
BootcampSchema.pre('remove', async function (next) {
    console.log('Courses removed' + this._id)
    await this.model('Course').deleteMany({ bootcamp: this._id })
    next()
})

// Adding viruals creating reverse ref and populating our parent collection with child
BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
})

module.exports = mongoose.model('Bootcamp', BootcampSchema);