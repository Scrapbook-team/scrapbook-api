const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var groupSchema = new Schema({
        name: {type: String, required: true, trim: true, sparse: true},
        description: String,
        background: String,
        members: [{
            memberId: Schema.ObjectId,
            name: String,
            _id: false
        }],
        conversations: [{
            conversationId: Schema.ObjectId,
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
