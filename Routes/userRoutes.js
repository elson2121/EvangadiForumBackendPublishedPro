const express = require("express");
const router = express.Router();
const { checkuser, register, login } = require("../Controller/userController");
const authMiddleware = require("../middleware/authMiddleware");

//Register
router.post("/register", register);
//Login
router.post("/login", login);
//check users
router.get("/checkUser", authMiddleware, checkuser);

module.exports = router;
