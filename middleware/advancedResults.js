const advancedResults = (model, populate) => async (req, res, next) => {
    let query;
    let reqQuery = { ...req.query }



    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    let find = JSON.parse(queryStr)

    query = model.find(find);
    if (populate) {
        query = query.populate(populate)
    }


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
        query = query.sort('-averageCost');
    }

    // Pagination
    var page = parseInt(req.query.page, 10) || 1;
    var limit = parseInt(req.query.limit, 10) || 25;
    var startIndex = (page - 1) * limit;
    var endIndex = page * limit;
    var Pagination = {}
    model.countDocuments().then(total => {
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



    query.then(foundResource => {
        if (foundResource.length == 0) {
            return res.status(404).json({
                count: foundResource.length,
                success: true,
                data: foundResource
            })
        }
        res.status(200).json({
            count: foundResource.length,
            success: true,
            Pagination,
            data: foundResource
        })
    }).catch(err => {
        res.status(500).json({ success: false, error: err, message: 'Network Error' })
    })
    next();
}

module.exports = advancedResults;