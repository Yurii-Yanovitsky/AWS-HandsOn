const s3 = require("../services/s3Service");
const upload = require("../services/s3UploadService");

const IMAGES_S3_BUCKET_NAME = "yanovitsky-demo1-s3";

exports.getImages = (req, res) => {
  const params = { Bucket: IMAGES_S3_BUCKET_NAME };

  s3.listObjectsV2(params, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error fetching images from S3" });
    }

    const images = data.Contents.map((obj) => {
      return `https://${params.Bucket}.s3.amazonaws.com/${encodeURIComponent(
        obj.Key
      )}`;
    });

    res.json(images);
  });
};

exports.uploadImage = (req, res, next) => {
  // Call the upload middleware
  upload.single("image")(req, res, (err) => {
    if (err) {
      // Handle multer upload error
      return res.status(400).send("File upload failed.");
    }

    return res.send("File uploaded.");
  });
};
