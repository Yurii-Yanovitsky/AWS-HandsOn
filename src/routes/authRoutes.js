const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/auth", authController.login);
router.get("/auth/callback", authController.callback);

module.exports = router;
