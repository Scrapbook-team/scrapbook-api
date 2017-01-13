const User = require('../models/schemas/user');

/*
 * Register a new user!
 */
exports.createUser = (req, res, next) => {
    // add validation
    

    var userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        hash: req.body.hash,
        bio: req.body.bio
    };

    var newUser = new User(userData);
    newUser.save((err, user) => {
        if(err) {
            if (err.code === 11000) return res.status(400).send('Email taken');
            return next(err);
        }
        return res.sendStatus(200);
    });
};
