const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var groupSchema = new Schema({
        name: {type: String, required: true, trim: true, sparse: true},
        description: String,
        background: String,
        members: [{
            type: Schema.ObjectId,
            ref: 'User'
        }],
        conversations: [{
            type: Schema.ObjectId,
            ref: 'Conversation'
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


var Group = mongoose.model('Group', groupSchema);

module.exports = Group;
