const mongoose = require('mongoose');
const User = require('../models/schemas/user');

/*
 * Get a user
 */
exports.getUserById = (req, res, next) => {
    User.findById(req.params.id).select('-contacts -media -groups -hash').exec((err, user) => {
        if (err) return next(err);
        if (!user) return res.status(404).send('No user with that ID');
        res.json(user);
    });
};

/*
 * Register a new user!
 */
exports.createUser = (req, res, next) => {
    var userData = {};

    // validate name
    if (req.body.firstName && typeof req.body.firstName === 'string')
        userData.firstName = req.body.firstName;
    else res.status(400).send('Invalid name');
    if (req.body.lastName && typeof req.body.lastName === 'string')
        userData.lastName = req.body.lastName
    else res.status(400).send('Invalid name');

    // validate email
    // http://emailregex.com
    if (req.body.email) {
        if (!(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.email)))
            return res.status(400).send('Invalid email');
        else
            userData.email = req.body.email;
    }

    // validate other data
    if (req.body.phone && typeof req.body.phone === 'string')
        userData.phone = req.body.phone;
    if (req.body.bio && typeof req.body.bio === 'string')
        userData.bio = req.body.bio;
    if (req.body.contacts && req.body.contacts.length != 0) {
        var addContacts = true;
        for(var i = 0; i < req.body.contacts.length; i++) {
            if (!validateContact(req.body.contacts[i])) {
                console.log("Invalid contacts");
                addContacts = false;
            }
        }
        if (addContacts) userData.contacts = req.body.contacts;
    }
    if (req.body.password) userData.hash = req.body.password;
    if (req.body.hash) userData.hash = req.body.hash;

    // save document
    var newUser = new User(userData);
    newUser.save()
    .then(result => next())
    .catch((err) => {
        if(err) 
            if (err.code === 11000) return res.status(400).send('Email taken');
        next(err);
    });
};

/*
 * Update a users document.
 */
exports.updateUser = (req, res, next) => {
    // check for new values
    if (!req.body.newValues) res.status(400).send('No new values given');
    
    // TODO: Authenticate user

    // validate data
    var userData = {};
    if (req.body.newValues.firstName && typeof req.body.newValues.firstName === 'string')
        userData.firstName = req.body.newValues.firstName;
    if (req.body.newValues.lastName && typeof req.body.newValues.lastName === 'string')
        userData.lastName = req.body.newValues.lastName;
    if (req.body.newValues.phone && typeof req.body.newValues.phone === 'string')
        userData.phone = req.body.newValues.phone;
    if (req.body.newValues.bio && typeof req.body.newValues.bio === 'string')
        userData.lastName = req.body.newValues.bio;
    
    // validate email
    // http://emailregex.com
    if (req.body.newValues.email) {
        if (!(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(req.body.newValues.email)))
            return res.status(400).send('Invalid email');
        else
            userData.email = req.body.email;
    }

    // update document
    User.findOneAndUpdate(req.params.id, userData, (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(404).send('No user with that id');
        return res.sendStatus(200);
    });
};

/*
 * Delete a user by their id.
 */
exports.deleteUser = (req, res, next) => {
    User.findOneAndRemove(req.params.id, (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(404).send('No user with that id');
        return res.sendStatus(200);
    });
};

/*
 * Get a users contacts.
 */
exports.getContacts = (req, res, next) => {
    User.findById(req.params.id).select('contacts').exec((err, user) => {
        if (err) return next(err);
        if (!user) return res.status(404).send('No user with that id');
        return res.json(user);
    });
};

/*
 * Add a contact to a user.
 */
exports.addContact = (req, res, next) => {
    // Validate contact
    if (!validateContact(req.body)) return res.status(400).send('Invalid contact');
    
    var contactData = {
        contactId: req.body.contactId,
        name: req.body.name
    };
    
    // Add new contact to array of contacts in user document.
    User.findByIdAndUpdate(req.params.id,
        {$addToSet: {contacts: contactData}}, 
        (err, user) => {
            if (err) return next(err);
            if (!user) return res.status(404).send('No user with that id');
            return res.sendStatus(200);
    });

};

/*
 * Validate a contact in a user's document
 */
function validateContact(contact) {
    if (!contact.contactId) return false;
    if (!contact.contactId.match(/^[0-9a-fA-F]{24}$/)) return false;
    if (!contact.name) return false;
    if (!(typeof contact.name === 'string')) return false;
    return true;
}

