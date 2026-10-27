
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getAllUsers,
    getAllRecipes,
    deleteRecipe,
      banUser,
    approveUser
} = require("../controllers/adminController");

// Both authentication and admin role are required
router.use(authMiddleware, adminMiddleware);

router.get("/users", getAllUsers);
router.get("/recipes", getAllRecipes);
router.delete("/recipes/:recipeId", deleteRecipe);
router.patch("/users/:userId/ban", banUser);
router.patch("/users/:userId/approve", approveUser);

module.exports = router;