const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var photoSchema = new Schema({
        name: {type: String, required: true, trim: true, sparse: true},
        caption: String,
        ownerId: {
            type: Schema.ObjectId,
            ref: 'User'
        },
        groupId: {
            type: Schema.ObjectId,
            ref: 'Group'
        },
        urls: [String],
        version: Number,
        reactions: [{
            type: Schema.ObjectId,
            ref: 'User'
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


var Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;
