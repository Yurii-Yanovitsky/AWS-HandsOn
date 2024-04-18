// routes/index.js
const express = require("express");
const imageController = require("../../src/controllers/imageController");
const thumbnailController = require("../../src/controllers/thumbnailController");
const ipController = require("../../src/controllers/ipController");

const router = express.Router();

router.get("/api/myip", ipController.getPublicIp);
router.get("/api/images", imageController.getImages);
router.post("/api/image", imageController.uploadImage);
router.get("/api/thumbnails", thumbnailController.getThumbnails);

module.exports = router;
