const express = require("express");

// set up a router
const router = express.Router();

const authController = require("../controllers/auth.controller");

// posts recieved by this router will be sent to authController
router.post("/register", authController.register);
router.post("/login", authController.login)

module.exports = router;