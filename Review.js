
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Recipe = require("./Recipe");

const Review = sequelize.define(
    "Review",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5,
                isInt: true
            }
        },

        comment: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        }
    },
    {
        indexes: [
            {
                unique: true,
                fields: ["userId", "recipeId"]
            }
        ]
    }
);

User.hasMany(Review, {
    foreignKey: {
        name: "userId",
        allowNull: false
    },
    onDelete: "CASCADE"
});

Review.belongsTo(User, {
    foreignKey: {
        name: "userId",
        allowNull: false
    }
});

Recipe.hasMany(Review, {
    foreignKey: {
        name: "recipeId",
        allowNull: false
    },
    onDelete: "CASCADE"
});

Review.belongsTo(Recipe, {
    foreignKey: {
        name: "recipeId",
        allowNull: false
    }
});

module.exports = Review;
