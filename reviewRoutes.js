
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createReview,
    getRecipeReviews,
    updateReview,
    deleteReview
} = require("../controllers/reviewController");

router.get("/recipe/:recipeId", getRecipeReviews);

router.post("/recipe/:recipeId", authMiddleware, createReview);

router.put("/:reviewId", authMiddleware, updateReview);

router.delete("/:reviewId", authMiddleware, deleteReview);

module.exports = router;
