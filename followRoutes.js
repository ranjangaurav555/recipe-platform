
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    followUser,
    unfollowUser,
    getFollowing,
    getFollowers
} = require("../controllers/followController");

router.post("/:userId", authMiddleware, followUser);
router.delete("/:userId", authMiddleware, unfollowUser);

router.get("/following", authMiddleware, getFollowing);
router.get("/followers", authMiddleware, getFollowers);

module.exports = router;