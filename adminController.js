
const User = require("../models/User");
const Recipe = require("../models/Recipe");

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["id", "name", "email", "role", "createdAt"],
            order: [["createdAt", "DESC"]]
        });

        return res.status(200).json({
            count: users.length,
            users
        });
    } catch (error) {
        console.error("Get all users error:", error);

        return res.status(500).json({
            message: "Unable to fetch users",
            error: error.message
        });
    }
};

// GET ALL RECIPES
exports.getAllRecipes = async (req, res) => {
    try {
        const recipes = await Recipe.findAll({
            include: [
                {
                    model: User,
                    attributes: ["id", "name", "email"]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        return res.status(200).json({
            count: recipes.length,
            recipes
        });
    } catch (error) {
        console.error("Admin get recipes error:", error);

        return res.status(500).json({
            message: "Unable to fetch recipes",
            error: error.message
        });
    }
};

// DELETE ANY RECIPE
exports.deleteRecipe = async (req, res) => {
    try {
        const recipeId = Number(req.params.recipeId);

        if (!Number.isInteger(recipeId) || recipeId <= 0) {
            return res.status(400).json({
                message: "Invalid recipe ID"
            });
        }

        const recipe = await Recipe.findByPk(recipeId);

        if (!recipe) {
            return res.status(404).json({
                message: "Recipe not found"
            });
        }

        await recipe.destroy();

        return res.status(200).json({
            message: "Recipe deleted successfully by admin"
        });
    } catch (error) {
        console.error("Admin delete recipe error:", error);

        return res.status(500).json({
            message: "Unable to delete recipe",
            error: error.message
        });
    }
};
// Ban a user
exports.banUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.status = "banned";
        await user.save();

        res.status(200).json({
            message: "User banned successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Approve a user
exports.approveUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.status = "approved";
        await user.save();

        res.status(200).json({
            message: "User approved successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};
