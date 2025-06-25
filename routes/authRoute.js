const express = require("express");
const {
    createUser,
    resetPassword,
    loginUserCtrl,
    logoutUser,
    getUserProfile,
} = require("../controller/userCtrl");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUserCtrl);
router.get("/user", protect, getUserProfile);
router.post("/resetPassword", resetPassword);
router.post("/logout", logoutUser);

module.exports = router;
