const mongoose = require('mongoose');
const Group = require('../models/schemas/group');
const Conversation = require('../models/schemas/conversation');

/*
 * Send a new message to a group.
 */
exports.sendMessage = (req, res, next) => {
    Group.findById(req.params.id)
        .select('conversations')
        .populate({
            path: 'conversations',
            options: {limit: 1}
        })
        .exec((err, group) => {
            if (err) return next(err);
            if (!group) return res.status(404).send('No group with that id');
            
            // Organize and validate message data.
            messageData = {};
            if (req.body.text && typeof req.body.text === 'string')
                messageData.text = req.body.text;
            if (req.body.mediaId && !mongoose.Types.ObjectId.isValdid(req.body.mediaId))
                messageData.mediaId = req.body.mediaId;
            if (req.body.userId && !mongoose.Types.ObjectId.isValid(req.body.userId))
                messageData.userId = req.body.userId;
            if (req.body.background && !mongoose.Types.ObjectId.isValid(req.body.background))
                messageData.background = req.body.background;

            messageData.timePosted = Date();
            
            conversationData = {
                messages: [messageData]
            };

            // Create first conversation.
            if (group.conversations.length === 0) {
                return createConversation(res, conversationData, req.params.id);
            }
            else { 
                newConversation = group.conversations[0];

                // If time since last message was greater than conversation timeout, create new conversation.
                if (conversationTimeout(newConversation.updatedDate)) {
                    return createConversation(res, conversationData, req.params.id);
                }
                // Otherwise, add to current conversation.
                else {
                    Conversation.findByIdAndUpdate(newConversation._id,
                        {$push: {messages: {$each: [messageData], $postion: 0}}},
                        (err, conversation) => {
                            if (err) return next(err);
                            if (!conversation)
                                return res.status(400).send('Failed to create conversation.');

                            return res.sendStatus(200);
                    });
                }
            }
    });
};

/*
 * Get the most recent messages.
 */
exports.getMessages = (req, res, next) => {
    // Validate group id.
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(404).send('Invalid group id.');
    
    // Pagination of messages
    var page = 0;
    if (req.query.page) {
        console.log(req.query.page);
        page = req.query.page;
    }

    // Get 10 conversations, based on the page position.
    Group.findById(req.params.id)
        .select('conversations')
        .populate('conversations')
        .slice('conversations', [page * 10, 10])
        .exec((err, group) => {
            if (err) return next(err);
            if (!group) return res.status(404).send('No group with that id.');

            return res.json(group.conversations);
        });
};

exports.readMessage = (req, res, next) => {
};

/*
 * Create a new conversation.
 */
function createConversation(res, conversationData, groupId) {
    // Create a new conversation in the database.
    newConversation = Conversation(conversationData);
    newConversation.save((err, conversation) => {
        if (err) return next(err);
        if (!conversation) 
            return res.status(400).send('Failed to create conversation.');
        
        // Add conversation to group as well.
        Group.findByIdAndUpdate(groupId,
            {$addToSet: {conversations: conversation._id}},
            (err, group) => {
                if (err) return next(err);
                if (!group) return res.status(404).send('No group with that id.');

                return res.sendStatus(200);
            });
    });
}

/*
 * Function for determining whether a new conversation should be created.
 */
function conversationTimeout(oldDate) {
    // Timeout is 30 minutes (1800000 seconds).
    var timeout = 1800000;
    
    console.log((new Date() - new Date(oldDate)));   

    // Test if more time than timeout has passed.
    if (new Date() - new Date(oldDate) > timeout) return true;

    return false;
}
