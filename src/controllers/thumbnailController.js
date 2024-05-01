const s3 = require("../services/s3Service");

const THUMBNAILS_S3_BUCKET_NAME = "yanovitsky-thumbnail-s3";

const thumbnailController = {
  getThumbnails: (req, res) => {
    const params = {
      Bucket: THUMBNAILS_S3_BUCKET_NAME,
    };

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

      res.status(200).json(images);
    });
  },
};

// Route to fetch images from S3 bucket and serve their URLs
module.exports = thumbnailController;
