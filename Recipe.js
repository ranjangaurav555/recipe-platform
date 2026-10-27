
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Recipe = sequelize.define("Recipe", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    ingredients: {
        type: DataTypes.JSONB,
        allowNull: false
    },

    instructions: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    category: {
        type: DataTypes.STRING,
        allowNull: false
    },

    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },

    cookingTime: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    // Number of people the recipe serves
    servings: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },

    // Recipe difficulty: Easy, Medium or Hard
    difficulty: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "Easy"
    },

    // Example: ["vegetarian", "gluten-free"]
    dietaryPreferences: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: []
    }
});

User.hasMany(Recipe, {
    foreignKey: {
        name: "userId",
        allowNull: false
    },
    onDelete: "CASCADE"
});

Recipe.belongsTo(User, {
    foreignKey: {
        name: "userId",
        allowNull: false
    }
});

module.exports = Recipe;
