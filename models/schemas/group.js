const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var groupSchema = new Schema({
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
            contactId: Schema.ObjectId,
            name: String,
            _id: false
        }],
        groups: [{
            groupId: Schema.ObjectId,
            name: String,
            description: String,
            _id: false
        }],
        media: [{
            mediaId: Schema.ObjectId,
            url: String,
            _id: false
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


var Group = mongoose.model('Group', groupSchema);

module.exports = Group;
