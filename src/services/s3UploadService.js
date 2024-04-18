const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const s3 = require("./s3Service");

const IMAGES_S3_BUCKET_NAME = "yanovitsky-demo1-s3";

// Configure multer to use S3 storage
const storageS3 = multerS3({
  s3: s3,
  bucket: IMAGES_S3_BUCKET_NAME,
  contentType: (req, file, cb) => {
    cb(null, file.mimetype);
  },
  key: function (req, file, cb) {
    // Use the fieldname of the file combined with the original file extension
    const extension = path.extname(file.originalname);

    let imagename = req.body.imagename
      ? req.body.imagename
      : Date.now() + "-" + file.originalname;

    // Check if the provided imagename includes an extension
    if (!path.extname(imagename)) {
      // If not, append the extension from the original imagename
      imagename += extension;
    }

    cb(null, imagename);
  },
});

// Create the multer instance
const upload = multer({ storage: storageS3 });

module.exports = upload;
