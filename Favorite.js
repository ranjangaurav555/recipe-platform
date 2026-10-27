
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Recipe = require("./Recipe");

const Favorite = sequelize.define(
    "Favorite",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
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

User.hasMany(Favorite, {
    foreignKey: {
        name: "userId",
        allowNull: false
    },
    onDelete: "CASCADE"
});

Favorite.belongsTo(User, {
    foreignKey: {
        name: "userId",
        allowNull: false
    }
});

Recipe.hasMany(Favorite, {
    foreignKey: {
        name: "recipeId",
        allowNull: false
    },
    onDelete: "CASCADE"
});

Favorite.belongsTo(Recipe, {
    foreignKey: {
        name: "recipeId",
        allowNull: false
    }
});

module.exports = Favorite;
