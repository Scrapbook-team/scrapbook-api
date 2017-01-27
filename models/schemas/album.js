const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var albumSchema = new Schema({
        name: {type: String, required: true, trim: true, sparse: true},
        description: String,
        groupId: {
            type: Schema.ObjectId,
            ref: 'Group'
        },
        photos: [{
            type: Schema.ObjectId,
            ref: 'Photo'
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


var Album = mongoose.model('Album', albumSchema);

module.exports = Album;
