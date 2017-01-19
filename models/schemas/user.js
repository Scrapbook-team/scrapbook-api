const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const validator = require('email-validator');

var userSchema = new Schema({
    firstName: {type: String, required: true, trim: true, sparse: true},
        lastName: {type: String, required: true, trim: true, sparse: true},
        email: {type: String, trim: true, required: true, unique: true, sparse: true},
        phone: {type: String, sparse: true},
        hash: {type: String, required: true},
        bio: String,
        isVerified: Boolean,
        token: String,
        resetToken: String,
        contacts: [{
            type: Schema.ObjectId,
            ref: 'User'
        }],
        groups: [{
            type: Schema.ObjectId,
            ref: 'Group'
        }],
        media: [{
            type: Schema.ObjectId,
            ref: 'Media'
        }]
    },
    {
        toObject: {getters: true},
        timestamps: {
            createdAt: 'createdDate',
            updatedAt: 'updatedDate'
        }
    }
);

// Validate email before saving document.
userSchema.pre('save', function(next) {
    // use email-validator or regex from emailregex.com
    if (!validator.validate(this.email) || 
            !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.email))
        return next(new Error('Invalid email'));
    if (this.isModified('hash'))
        this.hash = bcrypt.hashSync(this.hash);

    next();
});


// Validate password.
userSchema.methods.comparePassword = function(pw, callback) {
    bcrypt.compare(pw, this.hash, (err, isMatch) => {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};


var User = mongoose.model('User', userSchema);

module.exports = User;
