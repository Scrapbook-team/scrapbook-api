const mongoose = require('mongoose');
const Photo = require('../models/schemas/photo');
const Group = require('../models/schemas/group');
const User = require('../models/schemas/user');


exports.addPhoto = (req, res, next) => {
    // Validate input.
    var photoData = {version: 0};
    if (req.body.name && typeof req.body.name === 'string')
        photoData.name = req.body.name;
    if (req.body.caption && typeof req.body.caption === 'string')
        photoData.caption = req.body.caption;
    if (req.body.ownerId && mongoose.Types.ObjectId.isValid(req.body.ownerId))
        photoData.ownerId = req.body.ownerId;

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send('Invalid group id');
    else
        photoData.groupId = req.params.id;

    // Location of image.
    if (req.file.location && typeof req.file.location === 'string')
        photoData.urls = [req.file.location];

    // Save photo.
    var newPhoto = new Photo(photoData);
    newPhoto.save((err, photo) => {
        if (err) return next(err);
        if (!photo) return res.status(400).send('Failed to add photo');

        // Add photo to group.
        Group.findByIdAndUpdate(req.params.id,
            {$addToSet: {photos: photo._id}},
            (err, group) => {
                if (err) return next(err);
                if (!group) return res.status(404).send('No group with that id');
                
                // Add photo to user.
                User.findByIdAndUpdate(req.body.ownerId,
                    {$addToSet: {photos: photo._id}},
                    (err, user) => {
                        if (err) return next(err);
                        if (!user) return res.status(404).send('No user with that id');
                        
                        return res.json(photo);
                });
        });
    });
};

exports.getPhotos = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send('Invalid group id');

    Group.findById(req.params.id)
        .select('photos')
        .populate('photos')
        .exec((err, group) => {
            if (err) return next(err);
            if (!group) return res.status(404).send('No group with that id');

            return res.json(group.photos);
        });
};

/*
 * Get a single photo by id.
 */
exports.getPhoto = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send('Invalid photo id');
    
    Photo.findById(req.params.id, (err, photo) => {
        if (err) return next(err);
        if (!photo) return res.status(404).send('No photo with that id');

        return res.json(photo);
    });
};

/*
 * Update a photo's data, potentially adding a new revision.
 */
exports.updatePhoto = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send('Invalid photo id');
    
    updateData = {};

    if (req.body.name && typeof req.body.name === 'string')
        updateData.name = req.body.name;
    if (req.body.caption && typeof req.body.caption === 'string')
        updateData.caption = req.body.caption;
    // Push new url to top of version list, and increase version count.
    if (req.body.url && typeof req.body.url === 'string') {
        updateData.$push = {urls: req.body.url};
        updateData.$inc = {version: 1};
    }

    Photo.findByIdAndUpdate(req.params.id, updateData, (err, photo) => {
        if (err) return next(err);
        if (!photo) return res.status(404).send('No photo with that id');

        return res.sendStatus(200);
    });
};

/*
 * This will just remove a photo from a group.
 */
exports.removePhotoFromGroup = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send('Invalid group id');
    if (!mongoose.Types.ObjectId.isValid(req.body.photoId))
        return res.status(400).send('Invalid photo id');

    Group.findByIdAndUpdate(req.params.id,
        {$pull: {photos: req.body.photoId}},
        (err, group) => {
            if (err) return next(err);
            if (!group) return res.status(404).send('No group with that id');

            return res.sendStatus(200);
        });
};


