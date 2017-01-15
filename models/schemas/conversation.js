const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var conversationSchema = new Schema({
        messages: [{
            text: String,
            mediaId: Schema.ObjectId,
            url: String,
            timePosted: Date,
            userId: Schema.ObjectId,
            name: String,
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


var conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
