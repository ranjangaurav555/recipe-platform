
const express = require("express");
const router = express.Router();

const {
    createCollection,
    getMyCollections,
    addRecipeToCollection,
    removeRecipeFromCollection
} = require("../controllers/collectionController");

const authMiddleware = require("../middleware/authMiddleware");

// Create a collection
router.post("/", authMiddleware, createCollection);

// Get all my collections
router.get("/", authMiddleware, getMyCollections);

// Add a recipe to a collection
router.post(
    "/:collectionId/recipes/:recipeId",
    authMiddleware,
    addRecipeToCollection
);

// Remove a recipe from a collection
router.delete(
    "/:collectionId/recipes/:recipeId",
    authMiddleware,
    removeRecipeFromCollection
);

module.exports = router;
