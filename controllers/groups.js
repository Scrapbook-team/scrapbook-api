const mongoose = require('mongoose');
const Group = require('../models/schemas/group');
const Conversation = require('../models/schemas/group');
const User = require('../models/schemas/user');

/*
 * Get info for a group.
 */
exports.getGroupById = (req, res, next) => {
    // Validate id.
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(404).send('Invalid params');

    // Perform find query.
    Group.findById(req.params.id, (err, group) => {
        if (err) return next(err);
        if (!group) return res.status(404).send('No group with that id');
        res.json(group);
    });
};

/*
 * Create a new group.
 */
exports.createGroup = (req, res, next) => {
    // Validate data
    var groupData = {};
    
    if (req.body.name && typeof req.body.name === 'string')
        groupData.name = req.body.name;
    if (req.body.description && typeof req.body.description === 'string')
        groupData.description = req.body.description;
    if (req.body.ownerId && mongoose.Types.ObjectId.isValid(req.body.ownerId))
        groupData.ownerId = req.body.ownerId;

    // Validate members
    groupData.members = [];
    if (req.body.members) {
        for (var i = 0; i < req.body.members.length; i++) {
            // TODO Check that each member exists.
            if (validateMember(req.body.members[i]))
                groupData.members.push(req.body.members[i]);
        }
    }

    // Save document
    var newGroup = new Group(groupData);
    newGroup.save((err, group) => {
        if (err) return next(err);
        res.json(group);
    });
};

exports.updateGroup = (req, res, next) => {
    // Validate id.
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(404).send('Invalid params');
    
    // Check for new values.
    if (!req.body.newValues) 
        return res.status(400).send('No new values given');

    // Validate data.
    var groupData = {};
    if (req.body.newValues.name && typeof req.body.newValues.name === 'string')
        groupData.name = req.body.newValues.name;
    if (req.body.newValues.description && typeof req.body.newValues.description === 'string')
        groupData.description = req.body.newValues.description;

    // TODO Update Permissions
    // This can only be done if user is group owner

    // Update document.
    Group.findByIdAndUpdate(req.params.id, groupData, (err, group) => {
        if (err) return next(err);
        if (!group) return res.status(404).send('No group with that id');
        return res.sendStatus(200);
    });
};

exports.deleteGroup = (req, res, next) => {
};


exports.addMember = (req, res, next) => {
    // Validate memberId.
    if (!mongoose.Types.ObjectId.isValid(req.body.memberId))
        return res.status(404).send('Invalid memberId');

    User.findById(req.body.memberId, (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(404).send('No user with that id');

        var memberData = {
            memberId: user._id, 
            name: user.firstName + user.lastName
        };
        
        // Update group with new member.
        Group.findByIdAndUpdate(req.params.id,
        {$addToSet: {members: memberData}},
        (err, group) => {
            if (err) return next(err);
            if (!group) return res.status(404).send('No group with that id');
           
            var groupData = {
                groupId: group._id,
                name: group.name,
                description: group.description
            };
            
            // Now update user with group information.
            User.findByIdAndUpdate(req.body.memberId, 
            {$addToSet: {groups: groupData}},
            (err, user) => {
                if (err) return next(err);
                if (!user) return res.status(404).send('No user with that id');

                return res.sendStatus(200);
            });
        }); 

    });
    /*
    var memberData = {};
    var groupData = {};

    User.findById(req.body.memberId)
        .then(user => {
            console.log(user); 
            memberData.memberId = user._id;
            if (user.firstName && user.lastName)
                memberData.name = user.firstName + ' ' + user.lastName;
            else memberData.name = '';
        })
        .then(Group.findById(req.params.id).exec())
        .then(group => {
            console.log(req.params.id);
            groupData.groupId = group._id;
            groupData.name = group.name;
        })
        .then(Promise.all([
            User.findByIdAndUpdate(req.body.memberId,
                {$addToSet: {groups: groupData}}),
            Group.findByIdAndUpdate(req.params.id,
                {$addToSet: {members: memberData}})
        ]))
        .catch((err) => {
            return next(err);
         });*/
};

exports.getMembers = (req, res, next) => {
};

exports.removeMember = (req, res, next) => {
};

/*
 * Validate a member.
 */
function validateMember(member) {
    if (!member.memberId) return false;
    if (!member.memberId.match(/^[0-9a-fA-F]{24}$/)) return false;
    if (!member.name) return false;
    if (!(typeof member.name === 'string')) return false;
    return true;
}

