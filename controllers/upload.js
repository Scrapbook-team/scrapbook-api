if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'US Standard',
});

// Helps form the request for uploading to S3.
const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.AWS_BUCKET,
        acl: 'public-read',
        metadata(req, file, cb) {
            cb(null, {fieldName: file.fieldname});
        },
        key(req, file, cb) {
            cb(null, Date.now().toString());
        }
    })
});

/*
 * Upload a file to AWS S3
 */
exports.uploadPhoto = (req, res, next) => {
    // Upload the photo.
    upload.single('photo');
    req.url = 'https://s3.amazonaws.com/' + process.env.AWS_BUCKET + '/' + req.file.filename;
};
