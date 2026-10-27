
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Recipe = require("./Recipe");

const Collection = sequelize.define("Collection", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

// One user can create many collections
User.hasMany(Collection, {
    foreignKey: {
        name: "userId",
        allowNull: false
    },
    onDelete: "CASCADE"
});

Collection.belongsTo(User, {
    foreignKey: {
        name: "userId",
        allowNull: false
    }
});

// One collection can contain many recipes
Collection.belongsToMany(Recipe, {
    through: "CollectionRecipes",
    foreignKey: "collectionId",
    otherKey: "recipeId"
});

// One recipe can belong to many collections
Recipe.belongsToMany(Collection, {
    through: "CollectionRecipes",
    foreignKey: "recipeId",
    otherKey: "collectionId"
});

module.exports = Collection;
