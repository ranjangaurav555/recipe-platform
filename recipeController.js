
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const { Op } = require("sequelize");

// Convert JSON strings into arrays
function parseArray(value) {
    if (typeof value === "string") {
        try {
            value = JSON.parse(value);
        } catch (error) {
            return null;
        }
    }

    if (!Array.isArray(value)) {
        return null;
    }

    return value;
}

function parseIngredients(value) {
    const ingredients = parseArray(value);

    if (
        !ingredients ||
        ingredients.length === 0 ||
        !ingredients.every(item => typeof item === "string" && item.trim())
    ) {
        return null;
    }

    return ingredients.map(item => item.trim());
}

function parseDietaryPreferences(value) {
    if (value === undefined) {
        return undefined;
    }

    const preferences = parseArray(value);

    const allowed = [
        "vegetarian",
        "vegan",
        "gluten-free"
    ];

    if (
        !preferences ||
        !preferences.every(
            item =>
                typeof item === "string" &&
                allowed.includes(item.toLowerCase())
        )
    ) {
        return null;
    }

    return [...new Set(preferences.map(item => item.toLowerCase()))];
}

function validateDifficulty(value) {
    return ["Easy", "Medium", "Hard"].includes(value);
}

// CREATE RECIPE
exports.createRecipe = async (req, res) => {
    try {
        const {
            title,
            description,
            ingredients,
            instructions,
            category,
            imageUrl,
            cookingTime,
            servings = 1,
            difficulty = "Easy",
            dietaryPreferences = []
        } = req.body;

        const parsedIngredients = parseIngredients(ingredients);

        if (
            !title?.trim() ||
            !description?.trim() ||
            !parsedIngredients ||
            !instructions?.trim() ||
            !category?.trim() ||
            cookingTime === undefined ||
            cookingTime === ""
        ) {
            return res.status(400).json({
                message: "Please provide all required recipe fields"
            });
        }

        const time = Number(cookingTime);
        const servingCount = Number(servings);

        if (!Number.isInteger(time) || time <= 0) {
            return res.status(400).json({
                message: "Cooking time must be a positive integer"
            });
        }

        if (!Number.isInteger(servingCount) || servingCount <= 0) {
            return res.status(400).json({
                message: "Servings must be a positive integer"
            });
        }

        if (!validateDifficulty(difficulty)) {
            return res.status(400).json({
                message: "Difficulty must be Easy, Medium or Hard"
            });
        }

        const preferences = parseDietaryPreferences(dietaryPreferences);

        if (preferences === null) {
            return res.status(400).json({
                message:
                    "Dietary preferences must be an array containing vegetarian, vegan or gluten-free"
            });
        }

        const finalImageUrl = req.file
            ? `/uploads/${req.file.filename}`
            : imageUrl || null;

        const recipe = await Recipe.create({
            title: title.trim(),
            description: description.trim(),
            ingredients: parsedIngredients,
            instructions: instructions.trim(),
            category: category.trim(),
            imageUrl: finalImageUrl,
            cookingTime: time,
            servings: servingCount,
            difficulty,
            dietaryPreferences: preferences,
            userId: req.user.id
        });

        return res.status(201).json({
            message: "Recipe created successfully",
            recipe
        });
    } catch (error) {
        console.error("Create recipe error:", error);

        return res.status(500).json({
            message: "Unable to create recipe",
            error: error.message
        });
    }
};

// GET ALL RECIPES + SEARCH + FILTERS
exports.getAllRecipes = async (req, res) => {
    try {
        const {
            search,
            ingredient,
            category,
            difficulty,
            dietaryPreference,
            maxCookingTime
        } = req.query;

        const where = {};

        // Search by title, description or category
        if (search?.trim()) {
            const term = `%${search.trim()}%`;

            where[Op.or] = [
                { title: { [Op.iLike]: term } },
                { description: { [Op.iLike]: term } },
                { category: { [Op.iLike]: term } }
            ];
        }

        if (category) {
            where.category = { [Op.iLike]: category };
        }

        if (difficulty) {
            if (!validateDifficulty(difficulty)) {
                return res.status(400).json({
                    message: "Difficulty must be Easy, Medium or Hard"
                });
            }

            where.difficulty = difficulty;
        }

        if (maxCookingTime !== undefined) {
            const maxTime = Number(maxCookingTime);

            if (!Number.isInteger(maxTime) || maxTime <= 0) {
                return res.status(400).json({
                    message: "maxCookingTime must be a positive integer"
                });
            }

            where.cookingTime = { [Op.lte]: maxTime };
        }

        // Dietary preference filter
        if (dietaryPreference) {
            const allowed = [
                "vegetarian",
                "vegan",
                "gluten-free"
            ];

            const preference = dietaryPreference.toLowerCase();

            if (!allowed.includes(preference)) {
                return res.status(400).json({
                    message: "Invalid dietary preference"
                });
            }

            where.dietaryPreferences = {
                [Op.contains]: [preference]
            };
        }

        // Ingredient substring search
        if (ingredient?.trim()) {
            where.ingredients = {
                [Op.iLike]: `%${ingredient.trim()}%`
            };
        }

        const recipes = await Recipe.findAll({
            where,
            include: [
                {
                    model: User,
                    attributes: ["id", "name"]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        return res.status(200).json({
            count: recipes.length,
            recipes
        });
    } catch (error) {
        console.error("Get recipes error:", error);

        return res.status(500).json({
            message: "Unable to fetch recipes",
            error: error.message
        });
    }
};

// GET SINGLE RECIPE
exports.getRecipeById = async (req, res) => {
    try {
        const recipe = await Recipe.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    attributes: ["id", "name"]
                }
            ]
        });

        if (!recipe) {
            return res.status(404).json({
                message: "Recipe not found"
            });
        }

        return res.status(200).json({ recipe });
    } catch (error) {
        console.error("Get recipe error:", error);

        return res.status(500).json({
            message: "Unable to fetch recipe",
            error: error.message
        });
    }
};

// UPDATE RECIPE
exports.updateRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findByPk(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                message: "Recipe not found"
            });
        }

        if (Number(recipe.userId) !== Number(req.user.id)) {
            return res.status(403).json({
                message: "You can update only your own recipes"
            });
        }

        const allowedFields = [
            "title",
            "description",
            "ingredients",
            "instructions",
            "category"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        if (updates.ingredients !== undefined) {
            const parsed = parseIngredients(updates.ingredients);

            if (!parsed) {
                return res.status(400).json({
                    message: "Ingredients must be a non-empty array of strings"
                });
            }

            updates.ingredients = parsed;
        }

        if (updates.title !== undefined) {
            if (typeof updates.title !== "string" || !updates.title.trim()) {
                return res.status(400).json({
                    message: "Title cannot be empty"
                });
            }
            updates.title = updates.title.trim();
        }

        if (updates.description !== undefined) {
            if (
                typeof updates.description !== "string" ||
                !updates.description.trim()
            ) {
                return res.status(400).json({
                    message: "Description cannot be empty"
                });
            }
            updates.description = updates.description.trim();
        }

        if (updates.instructions !== undefined) {
            if (
                typeof updates.instructions !== "string" ||
                !updates.instructions.trim()
            ) {
                return res.status(400).json({
                    message: "Instructions cannot be empty"
                });
            }
            updates.instructions = updates.instructions.trim();
        }

        if (updates.category !== undefined) {
            if (
                typeof updates.category !== "string" ||
                !updates.category.trim()
            ) {
                return res.status(400).json({
                    message: "Category cannot be empty"
                });
            }
            updates.category = updates.category.trim();
        }

        if (req.body.cookingTime !== undefined) {
            const time = Number(req.body.cookingTime);

            if (!Number.isInteger(time) || time <= 0) {
                return res.status(400).json({
                    message: "Cooking time must be a positive integer"
                });
            }

            updates.cookingTime = time;
        }

        if (req.body.servings !== undefined) {
            const servingCount = Number(req.body.servings);

            if (!Number.isInteger(servingCount) || servingCount <= 0) {
                return res.status(400).json({
                    message: "Servings must be a positive integer"
                });
            }

            updates.servings = servingCount;
        }

        if (req.body.difficulty !== undefined) {
            if (!validateDifficulty(req.body.difficulty)) {
                return res.status(400).json({
                    message: "Difficulty must be Easy, Medium or Hard"
                });
            }

            updates.difficulty = req.body.difficulty;
        }

        if (req.body.dietaryPreferences !== undefined) {
            const preferences = parseDietaryPreferences(
                req.body.dietaryPreferences
            );

            if (preferences === null) {
                return res.status(400).json({
                    message: "Invalid dietary preferences"
                });
            }

            updates.dietaryPreferences = preferences;
        }

        if (req.file) {
            updates.imageUrl = `/uploads/${req.file.filename}`;
        } else if (req.body.imageUrl !== undefined) {
            updates.imageUrl = req.body.imageUrl || null;
        }

        await recipe.update(updates);

        return res.status(200).json({
            message: "Recipe updated successfully",
            recipe
        });
    } catch (error) {
        console.error("Update recipe error:", error);

        return res.status(500).json({
            message: "Unable to update recipe",
            error: error.message
        });
    }
};

// DELETE RECIPE
exports.deleteRecipe = async (req, res) => {
    try {
        const recipe = await Recipe.findByPk(req.params.id);

        if (!recipe) {
            return res.status(404).json({
                message: "Recipe not found"
            });
        }

        if (Number(recipe.userId) !== Number(req.user.id)) {
            return res.status(403).json({
                message: "You can delete only your own recipes"
            });
        }

        await recipe.destroy();

        return res.status(200).json({
            message: "Recipe deleted successfully"
        });
    } catch (error) {
        console.error("Delete recipe error:", error);

        return res.status(500).json({
            message: "Unable to delete recipe",
            error: error.message
        });
    }
};
