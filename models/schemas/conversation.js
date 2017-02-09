const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var conversationSchema = new Schema({
        messages: [{
            text: String,
            photoId: Schema.ObjectId,
            createdAt: Date,
            userId: {type: Schema.ObjectId, ref: 'User'},
            background: String,
            readBy: [{
                _id: false,
                name: String
            }]
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


var Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
