
const Recipe = require("../models/Recipe");
const Follow = require("../models/Follow");
const User = require("../models/User");

// GET ACTIVITY FEED
exports.getActivityFeed = async (req, res) => {
    try {
        // Find users whom the logged-in user follows
        const following = await Follow.findAll({
            where: {
                followerId: req.user.id
            },
            attributes: ["followingId"]
        });

        const followingIds = following.map(
            (follow) => follow.followingId
        );

        // If the user follows nobody, return an empty feed
        if (followingIds.length === 0) {
            return res.status(200).json({
                count: 0,
                recipes: []
            });
        }

        // Get recent recipes created by followed users
        const recipes = await Recipe.findAll({
            where: {
                userId: followingIds
            },
            include: [
                {
                    model: User,
                    attributes: ["id", "name"]
                }
            ],
            order: [["createdAt", "DESC"]],
            limit: 20
        });

        return res.status(200).json({
            count: recipes.length,
            recipes
        });

    } catch (error) {
        console.error("Activity feed error:", error);

        return res.status(500).json({
            message: "Unable to fetch activity feed",
            error: error.message
        });
    }
};
