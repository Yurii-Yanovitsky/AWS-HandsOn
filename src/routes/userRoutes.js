const express = require("express");
const userController = require("../controllers/userController");
// const ipController = require("../controllers/ipController");

const router = express.Router();

// router.get("/myip", ipController.getPublicIp);
router.get("/api/user", userController.getUser);
router.get("/api/user/:id", userController.getUser);

module.exports = router;