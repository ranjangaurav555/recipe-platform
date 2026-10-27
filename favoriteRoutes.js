
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    addFavorite,
    getFavorites,
    removeFavorite
} = require("../controllers/favoriteController");

router.post("/:recipeId", authMiddleware, addFavorite);
router.get("/", authMiddleware, getFavorites);
router.delete("/:recipeId", authMiddleware, removeFavorite);

module.exports = router;
