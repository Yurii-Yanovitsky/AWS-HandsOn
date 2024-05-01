const express = require("express");
const imageController = require("../controllers/imageController");
const thumbnailController = require("../controllers/thumbnailController");
const {
  restrictToAllowedGroups,
} = require("../middlewares/restrictToAllowedGroups");

const router = express.Router();

router.get("/api/images", imageController.getImages);
router.post("/api/image", restrictToAllowedGroups, imageController.uploadImage);
router.get("/api/thumbnails", thumbnailController.getThumbnails);

module.exports = router;
