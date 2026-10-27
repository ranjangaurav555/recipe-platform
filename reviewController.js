
const Review = require("../models/Review");
const User = require("../models/User");
const Recipe = require("../models/Recipe");

// CREATE REVIEW
exports.createReview = async (req, res) => {
    try {
        const recipeId = Number(req.params.recipeId);
        const { rating, comment } = req.body;

        // Validate recipe ID
        if (!Number.isInteger(recipeId) || recipeId <= 0) {
            return res.status(400).json({
                message: "Invalid recipe ID"
            });
        }

        // Validate rating
        const numericRating = Number(rating);

        if (
            !Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        // Validate comment
        if (typeof comment !== "string" || !comment.trim()) {
            return res.status(400).json({
                message: "Review comment is required"
            });
        }

        // Check whether recipe exists
        const recipe = await Recipe.findByPk(recipeId);

        if (!recipe) {
            return res.status(404).json({
                message: "Recipe not found"
            });
        }

        // Check whether this user already reviewed this recipe
        const existingReview = await Review.findOne({
            where: {
                userId: req.user.id,
                recipeId: recipeId
            }
        });

        if (existingReview) {
            return res.status(409).json({
                message: "You have already reviewed this recipe"
            });
        }

        // Create review
        const review = await Review.create({
            userId: req.user.id,
            recipeId: recipeId,
            rating: numericRating,
            comment: comment.trim()
        });

        return res.status(201).json({
            message: "Review submitted successfully",
            review: review
        });

    } catch (error) {
        console.error("Create review error:", error);

        return res.status(500).json({
            message: "Unable to submit review",
            error: error.message
        });
    }
};


// GET ALL REVIEWS FOR A RECIPE
exports.getRecipeReviews = async (req, res) => {
    try {
        const recipeId = Number(req.params.recipeId);

        if (!Number.isInteger(recipeId) || recipeId <= 0) {
            return res.status(400).json({
                message: "Invalid recipe ID"
            });
        }

        // Check recipe exists
        const recipe = await Recipe.findByPk(recipeId);

        if (!recipe) {
            return res.status(404).json({
                message: "Recipe not found"
            });
        }

        // Fetch reviews with reviewer details
        const reviews = await Review.findAll({
            where: {
                recipeId: recipeId
            },
            include: [
                {
                    model: User,
                    attributes: ["id", "name"]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        // Calculate average rating
        const averageRating = reviews.length > 0
            ? reviews.reduce(
                (total, review) => total + Number(review.rating),
                0
            ) / reviews.length
            : 0;

        return res.status(200).json({
            count: reviews.length,
            averageRating: Number(averageRating.toFixed(1)),
            reviews: reviews
        });

    } catch (error) {
        console.error("Get reviews error:", error);

        return res.status(500).json({
            message: "Unable to fetch reviews",
            error: error.message
        });
    }
};


// UPDATE MY REVIEW
exports.updateReview = async (req, res) => {
    try {
        const reviewId = Number(req.params.reviewId);
        const { rating, comment } = req.body;

        // Validate review ID
        if (!Number.isInteger(reviewId) || reviewId <= 0) {
            return res.status(400).json({
                message: "Invalid review ID"
            });
        }

        // Find review
        const review = await Review.findByPk(reviewId);

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        // Check ownership
        if (Number(review.userId) !== Number(req.user.id)) {
            return res.status(403).json({
                message: "You can update only your own review"
            });
        }

        const updates = {};

        // Validate rating if provided
        if (rating !== undefined) {
            const numericRating = Number(rating);

            if (
                !Number.isInteger(numericRating) ||
                numericRating < 1 ||
                numericRating > 5
            ) {
                return res.status(400).json({
                    message: "Rating must be between 1 and 5"
                });
            }

            updates.rating = numericRating;
        }

        // Validate comment if provided
        if (comment !== undefined) {
            if (typeof comment !== "string" || !comment.trim()) {
                return res.status(400).json({
                    message: "Review comment cannot be empty"
                });
            }

            updates.comment = comment.trim();
        }

        // Reject empty update body
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Please provide rating or comment to update"
            });
        }

        // Update review
        await review.update(updates);

        return res.status(200).json({
            message: "Review updated successfully",
            review: review
        });

    } catch (error) {
        console.error("Update review error:", error);

        return res.status(500).json({
            message: "Unable to update review",
            error: error.message
        });
    }
};


// DELETE MY REVIEW
exports.deleteReview = async (req, res) => {
    try {
        const reviewId = Number(req.params.reviewId);

        // Validate review ID
        if (!Number.isInteger(reviewId) || reviewId <= 0) {
            return res.status(400).json({
                message: "Invalid review ID"
            });
        }

        // Find review
        const review = await Review.findByPk(reviewId);

        if (!review) {
            return res.status(404).json({
                message: "Review not found"
            });
        }

        // Check ownership
        if (Number(review.userId) !== Number(req.user.id)) {
            return res.status(403).json({
                message: "You can delete only your own review"
            });
        }

        await review.destroy();

        return res.status(200).json({
            message: "Review deleted successfully"
        });

    } catch (error) {
        console.error("Delete review error:", error);

        return res.status(500).json({
            message: "Unable to delete review",
            error: error.message
        });
    }
};
