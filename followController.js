
const Follow = require("../models/Follow");
const User = require("../models/User");

// FOLLOW A USER
exports.followUser = async (req, res) => {
    try {
        const followingId = Number(req.params.userId);
        const followerId = Number(req.user.id);

        if (!Number.isInteger(followingId) || followingId <= 0) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        if (followingId === followerId) {
            return res.status(400).json({
                message: "You cannot follow yourself"
            });
        }

        const user = await User.findByPk(followingId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const existingFollow = await Follow.findOne({
            where: {
                followerId,
                followingId
            }
        });

        if (existingFollow) {
            return res.status(409).json({
                message: "You are already following this user"
            });
        }

        const follow = await Follow.create({
            followerId,
            followingId
        });

        return res.status(201).json({
            message: "User followed successfully",
            follow
        });
    } catch (error) {
        console.error("Follow user error:", error);

        return res.status(500).json({
            message: "Unable to follow user",
            error: error.message
        });
    }
};

// UNFOLLOW A USER
exports.unfollowUser = async (req, res) => {
    try {
        const followingId = Number(req.params.userId);
        const followerId = Number(req.user.id);

        if (!Number.isInteger(followingId) || followingId <= 0) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        const follow = await Follow.findOne({
            where: {
                followerId,
                followingId
            }
        });

        if (!follow) {
            return res.status(404).json({
                message: "You are not following this user"
            });
        }

        await follow.destroy();

        return res.status(200).json({
            message: "User unfollowed successfully"
        });
    } catch (error) {
        console.error("Unfollow user error:", error);

        return res.status(500).json({
            message: "Unable to unfollow user",
            error: error.message
        });
    }
};

// GET USERS I FOLLOW
exports.getFollowing = async (req, res) => {
    try {
        const following = await Follow.findAll({
            where: {
                followerId: req.user.id
            },
            include: [
                {
                    model: User,
                    as: "FollowingUser",
                    attributes: ["id", "name", "email"]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        return res.status(200).json({
            count: following.length,
            following
        });
    } catch (error) {
        console.error("Get following error:", error);

        return res.status(500).json({
            message: "Unable to fetch following list",
            error: error.message
        });
    }
};

// GET MY FOLLOWERS
exports.getFollowers = async (req, res) => {
    try {
        const followers = await Follow.findAll({
            where: {
                followingId: req.user.id
            },
            include: [
                {
                    model: User,
                    as: "Follower",
                    attributes: ["id", "name", "email"]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        return res.status(200).json({
            count: followers.length,
            followers
        });
    } catch (error) {
        console.error("Get followers error:", error);

        return res.status(500).json({
            message: "Unable to fetch followers",
            error: error.message
        });
    }
};
