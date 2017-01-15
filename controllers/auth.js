const User = require('../models/schemas/user');
const jwt = require('jwt-simple');
const config = require('../models/config');

const jwt_parameters = ['email', 'isVerified', 'isAdmin'];

/*
 * Login a user and return them an auth token.
 */
exports.loginUser = (req, res, next) => {
    // Validate email and password
    if (typeof req.body.email !== 'string')
        return res.status(400).send('Missing email');
    if (typeof req.body.password !== 'string')
        return res.status(400).send('Missing password');
    
    // Check if user exists
    User.findOne({email: req.body.email}, (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(400).send('No user with that email');

        // Validate password.
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (err) return next(err);
            if (!isMatch) return res.status(401).send('Incorrect password');

            var payload = { id: user._id };
            jwt_parameters.forEach((s) => payload[s] = user[s]);
            if (user.firstName) payload.firstName = user.firstName;
            if (user.lastName) payload.lastName = user.lastName;

            // Create auth token and return to user.
            var token = jwt.encode(payload, config.secret);
            user.token = token;
            user.save((err) => {
                if (err) return next(err);
                res.json({token: token, id: user._id});
            });
        });
    });
};

exports.validateToken = (req, res, next) => validateToken(req, res, next);

/*
 * Validate JWT.
 */
function validateToken(req, res, next) {
    var token = req.query.token || req.body.token || req.headers['x-access-token'];

    // Decode token.
    try {
        var decoded = jwt.decode(token, config.secret);
    } catch (err) {
        return res.status(403).send('Failed to authenticate token');
    }

    // Check received token against stored token.
    User.findById(decoded.id, (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(403).send('Invalid token user ID');
        var expired = false;
        jwt_parameters.forEach((s) => {
            if (decoded[s] !== user[s]) expired = true
        });
        if (expired || token !== user.token)
            return res.status(403).send('Expired token');

        req.user = user;
        next();
    });
}
