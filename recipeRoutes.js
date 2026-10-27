
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
    createRecipe,
    getAllRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe
} = require("../controllers/recipeController");

// GET all recipes
router.get("/", getAllRecipes);

// GET one recipe
router.get("/:id", getRecipeById);

// CREATE recipe with optional image
router.post(
    "/",
    authMiddleware,
    upload.single("image"),
    createRecipe
);

// UPDATE recipe with optional image
router.put(
    "/:id",
    authMiddleware,
    upload.single("image"),
    updateRecipe
);

// DELETE recipe
router.delete("/:id", authMiddleware, deleteRecipe);

module.exports = router;
