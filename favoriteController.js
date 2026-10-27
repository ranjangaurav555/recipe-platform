
const Favorite = require("../models/Favorite");
const Recipe = require("../models/Recipe");
const User = require("../models/User");

// ADD RECIPE TO FAVORITES
exports.addFavorite = async (req, res) => {
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

        const existingFavorite = await Favorite.findOne({
            where: {
                userId: req.user.id,
                recipeId
            }
        });

        if (existingFavorite) {
            return res.status(409).json({
                message: "Recipe is already in favorites"
            });
        }

        const favorite = await Favorite.create({
            userId: req.user.id,
            recipeId
        });

        return res.status(201).json({
            message: "Recipe added to favorites",
            favorite
        });
    } catch (error) {
        console.error("Add favorite error:", error.message);

        return res.status(500).json({
            message: "Unable to add favorite"
        });
    }
};

// GET MY FAVORITES
exports.getFavorites = async (req, res) => {
    try {
        const favorites = await Favorite.findAll({
            where: {
                userId: req.user.id
            },
            include: [
                {
                    model: Recipe,
                    include: [
                        {
                            model: User,
                            attributes: ["id", "name"]
                        }
                    ]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        return res.status(200).json({
            count: favorites.length,
            favorites
        });
    } catch (error) {
        console.error("Get favorites error:", error.message);

        return res.status(500).json({
            message: "Unable to fetch favorites"
        });
    }
};

// REMOVE RECIPE FROM FAVORITES
exports.removeFavorite = async (req, res) => {
    try {
        const recipeId = Number(req.params.recipeId);

        if (!Number.isInteger(recipeId) || recipeId <= 0) {
            return res.status(400).json({
                message: "Invalid recipe ID"
            });
        }

        const favorite = await Favorite.findOne({
            where: {
                userId: req.user.id,
                recipeId
            }
        });

        if (!favorite) {
            return res.status(404).json({
                message: "Favorite recipe not found"
            });
        }

        await favorite.destroy();

        return res.status(200).json({
            message: "Recipe removed from favorites"
        });
    } catch (error) {
        console.error("Remove favorite error:", error.message);

        return res.status(500).json({
            message: "Unable to remove favorite"
        });
    }
};

