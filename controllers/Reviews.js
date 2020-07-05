const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults')


exports.Get_All_Reviews = (req, res) => {
    if (req.params.bootcampId) {
        Review.find({ bootcamp: req.params.bootcampId })
            .exec()
            .then(foundReviews => {
                if (foundReviews.length == 0) {
                    return res.status(404).json({
                        count: foundReviews.length,
                        success: true,
                        message: 'Not Found Courses',
                        reviews: foundCourses
                    })
                }
                res.status(200).json({
                    count: foundReviews.length,
                    success: true,
                    message: `Found All Reviews for this  bootcamp `,
                    reviews: foundReviews
                })
            })
            .catch(err => err.status(500).json({
                error: err
            }))
    } else {
        advancedResults();
    }
}
exports.Get_Single_Review = (req, res) => {

    Review.findById({ _id: req.params.id })
        .populate({ path: 'bootcamp', select: 'name description' })
        .exec()
        .then(foundReview => {
            if (!foundReview) {
                return res.status(404).json({
                    success: false,
                    message: `Not Found Review with id ${req.params.id} `,
                    review: foundReview
                })
            }
            res.status(200).json({
                success: true,
                message: `Found Review with id ${req.params.id}  `,
                review: foundReview
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err.name,
                message: 'Object Id is Wrong or network issue'
            })
        })
}

exports.Add_Review = (req, res) => {
    console.log(req.body)
    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id;
    Bootcamp.findById(req.params.bootcampId).exec().then(bootcamp => {
        if (!bootcamp) return res.status(404).json({ success: false, message: 'No Bootcamp found to give revews' })


        const newReview = new Review(req.body)
        newReview.save().then(review => {
            res.status(201).json({ success: true, createdReview: review })
        }).catch(err => {
            if (err.name = 'MongoError') return res.status(500).json({ success: false, message: 'Already reviewed' })
            res.status(500).json({ success: false, error: err, message: 'some error occured' })
        })
    })
}


exports.update_Review = (req, res) => {
    Review.findById(req.params.id).exec().then(review => {
        if (!review) return res.status(404).json({ success: false, message: `No review found with id ${req.params.id}` })

        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: `You dont have access to update this review  ${review.title}` })
            next()
        }
        Review.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .exec().then(review => {
                res.status(201).json({ success: true, updatedReview: review })
            })


    }).catch(err => {
        res.status(500).json({ success: false, error: err.message })
    })
}
exports.delete_Review = (req, res) => {
    Review.findById(req.params.id)
        .exec().then(review => {
            if (!review) {
                return res.status(404).json({ success: false, message: 'Not Found Entry with this ' + req.params.id + '  to delete' })
            }
            if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return res.status(401).json({ success: false, message: `You dont have access to delete this review  ${review.title}` })
                next()
            }

            review.remove();
            res.status(200).json({ success: true, deletedReview: review })
        }).catch(err => res.status(500).json({ error: err, success: false, message: 'Wrong Object Id or network issue' }))

}






