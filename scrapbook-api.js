const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const config = require('./models/config');

const users = require('./controllers/users');
const auth = require('./controllers/auth');
const group = require('./controllers/groups');
const message = require('./controllers/messages');
const photo = require('./controllers/photos');
const album = require('./controllers/albums');
const upload = require('./controllers/upload');

// http://mongoosejs.com/docs/promises.html
mongoose.Promise = global.Promise;
mongoose.connect(config.dbUrl, {server: {socketOptions: {keepAlive: 120}}});

var app = express();
var router = express.Router();

// log if in dev mode
if (app.get('env') !== 'production') app.use(logger('dev'));

// run init script from init directory
//require('./init/init');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//================================================
// Middleware
//================================================

// placeholder

//================================================
// Routes
//================================================

// User routes
router.route('/users')
    .post(users.createUser, auth.loginUser)
router.route('/users/:id')
    .get(auth.validateToken, users.getUserById)
    .put(auth.validateToken, users.updateUser)
    .delete(auth.validateToken, users.deleteUser)
router.route('/users/:id/contacts')
    .get(auth.validateToken, users.getContacts)
    .post(auth.validateToken, users.addContact)
router.route('/users/:id/contacts/:contactId')
    .delete(users.removeContact)
router.route('/users/:id/groups')
    .get(auth.validateToken, users.getGroups)
router.route('/users/:id/photos')
    .get(auth.validateToken, users.getPhotos)
router.route('/users/:id/photos/:photoId')
    .delete(auth.validateToken, users.removePhotoFromUser)

router.route('/groups')
    .post(auth.validateToken, group.createGroup)
router.route('/groups/:id')
    .get(auth.validateToken, group.getGroupById)
    .put(auth.validateToken, group.updateGroup)
router.route('/groups/:id/members')
    .post(auth.validateToken, group.addMember)
    .get(auth.validateToken, group.getMembers)
    .delete(auth.validateToken, group.removeMember)
router.route('/groups/:id/messages')
    .post(auth.validateToken, message.sendMessage)
    .get(auth.validateToken, message.getMessages)
    .put(auth.validateToken, message.readMessage)
router.route('/groups/:id/photos')
    .post(auth.validateToken, upload.upload.single('photo'), photo.addPhoto)
    .get(auth.validateToken, photo.getPhotos)
router.route('/groups/:id/photos/:photoId')
    .delete(auth.validateToken, photo.removePhotoFromGroup)
router.route('/groups/:id/albums')
    .post(auth.validateToken, album.createAlbum)
    .get(auth.validateToken, album.getAlbums)

router.route('/photos/:id')
    .get(auth.validateToken, photo.getPhoto)
    .put(auth.validateToken, photo.updatePhoto)

router.route('/albums/:id')
    .get(auth.validateToken, album.getAlbum)
    .put(auth.validateToken, album.updateAlbum)
    .delete(auth.validateToken, album.removeAlbum)

router.route('/auth/token')
    .post(auth.loginUser);

    
app.use('/', router);

// handle 404
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log(err);
        res.status(err.status || 500).send();
    });
}

// production error handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500).send();
});

var server = app.listen(config.port, function() {
    console.log('Listening at http://localhost:%s in %s mode',
    server.address().port, app.get('env'));
});

module.exports = app;

