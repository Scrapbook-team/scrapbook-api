const mongoose = require('mongoose');
const Album = require('../models/schemas/album');
const Photo = require('../models/schemas/photo');
const Group = require('../models/schemas/group');

exports.createAlbum = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send('Invalid group id');
    
    // Validate data
    var albumData = {groupId: req.params.id};
    if (req.body.name && typeof req.body.name === 'string')
        albumData.name = req.body.name;
    if (req.body.description && typeof req.body.description === 'string')
        albumData.description = req.body.description;
    
    // Pre-save hooks will validate the list of photos.
    if (req.body.photos) albumData.photos = req.body.photos;

    var newAlbum = new Album(albumData);
    newAlbum.save((err, album) => {
        if (err) return next(err);
        if (!album) return res.status(400).send('Unable to create album');
        
        Group.findByIdAndUpdate(req.params.id,
            {$addToSet: {albums: album._id}},
            (err, group) => {
                if (err) return next(err);
                if (!group) return res.status(404).send('No group with that id');

                return res.json(album);
            });
    });
};

/*
 * Get all albums for a single group.
 */
exports.getAlbums = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send('Invalid group id');
    
    // Get all albums and populate their photo arrays.
    Group.findById(req.params.id)
        .select('albums')
        .populate('albums')
        .exec((err, group) => {
            if (err) return next(err);
            if (!group) return res.status(404).send('No group with that id');

            return res.json(group.albums);
        });
};

/*
 * Get album by id.
 */
exports.getAlbum = (req, res, next) => { 
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send('Invalid album id');

    Album.findById(req.params.id, (err, album) => {
        if (err) return next(err);
        if (!album) return res.status(404).send('No album with that id');

        return res.json(album);
    });
};

/*
 * Update info to album/add new photos to album.
 */
exports.updateAlbum = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(400).send('Invalid album id');

    var updateData = {};
    if (req.body.name && typeof req.body.name === 'string')
        updateData.name = req.body.name;
    if (req.body.description && typeof req.body.description === 'string')
        updateData.descriptiion = req.body.description;

    // If additional photos are present, add to set. (They will be validated later).
    if (req.body.photos)
        updateData.$addToSet = {photos: {$each: req.body.photos}};

    Album.findByIdAndUpdate(req.params.id, updateData, (err, album) => {
        if (err) return next(err);
        if (!album) return res.status(404).send('No album with that id');

        return res.sendStatus(200);
    });
};

/*
 * If a photo is given, remove from album. Otherwise, delete album.
 */
exports.removeAlbum = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id));
     
    // If photo is given, remove it from album.
    if (req.body.photo && mongoose.Types.ObjectId.isValid(req.body.photo)) {
        Album.findByIdAndUpdate(req.params.id,
            {$pull: {photos: req.body.photo}},
            (err, album) => {
                if (err) return next(err);
                if (!album) return res.status(404).send('No album with that id');

                return res.sendStatus(200);
        });
    }
    // Else remove entire album.
    else {
        Album.findByIdAndRemove(req.params.id, (err, album) => {
            if (err) return next(err);
            if (!album) return res.status(404).send('No album with that id');

            return res.sendStatus(200);
        });
    }
};
