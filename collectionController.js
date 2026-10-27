
const Collection = require("../models/Collection");
const Recipe = require("../models/Recipe");
const User = require("../models/User");

// CREATE COLLECTION
exports.createCollection = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                message: "Collection name is required"
            });
        }

        const collection = await Collection.create({
            name: name.trim(),
            description:
                typeof description === "string"
                    ? description.trim()
                    : null,
            userId: req.user.id
        });

        return res.status(201).json({
            message: "Collection created successfully",
            collection
        });
    } catch (error) {
        console.error("Create collection error:", error);

        return res.status(500).json({
            message: "Unable to create collection"
        });
    }
};

// GET MY COLLECTIONS
exports.getMyCollections = async (req, res) => {
    try {
        const collections = await Collection.findAll({
            where: { userId: req.user.id },
            include: [
                {
                    model: Recipe,
                    through: { attributes: [] },
                    required: false
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        return res.status(200).json({
            count: collections.length,
            collections
        });
    } catch (error) {
        console.error("Get collections error:", error);

        return res.status(500).json({
            message: "Unable to fetch collections"
        });
    }
};

 // ADD RECIPE TO COLLECTION
exports.addRecipeToCollection = async (req, res) => {
    try {
        const { collectionId, recipeId } = req.params;

        const collection = await Collection.findOne({
            where: {
                id: collectionId,
                userId: req.user.id
            }
        });

        if (!collection) {
            return res.status(404).json({
                message: "Collection not found"
            });
        }

        const recipe = await Recipe.findByPk(recipeId);

        if (!recipe) {
            return res.status(404).json({
                message: "Recipe not found"
            });
        }

        const existing = await collection.getRecipes({
            where: { id: recipe.id }
        });

        if (existing.length > 0) {
            return res.status(409).json({
                message: "Recipe is already in this collection"
            });
        }

        await collection.addRecipe(recipe);

        return res.status(200).json({
            message: "Recipe added to collection successfully"
        });
    } catch (error) {
        console.error("Add recipe error:", error);

        return res.status(500).json({
            message: "Unable to add recipe to collection"
        });
    }
};

// REMOVE RECIPE FROM COLLECTION
exports.removeRecipeFromCollection = async (req, res) => {
    try {
        const { collectionId, recipeId } = req.params;

        const collection = await Collection.findOne({
            where: {
                id: collectionId,
                userId: req.user.id
            }
        });

        if (!collection) {
            return res.status(404).json({
                message: "Collection not found"
            });
        }

        const recipe = await Recipe.findByPk(recipeId);

        if (!recipe) {
            return res.status(404).json({
                message: "Recipe not found"
            });
        }

        await collection.removeRecipe(recipe);

        return res.status(200).json({
            message: "Recipe removed from collection successfully"
        });
    } catch (error) {
        console.error("Remove recipe error:", error);

        return res.status(500).json({
            message: "Unable to remove recipe from collection"
        });
    }
};
