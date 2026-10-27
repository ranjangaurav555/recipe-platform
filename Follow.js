
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Follow = sequelize.define(
    "Follow",
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
                fields: ["followerId", "followingId"]
            }
        ]
    }
);

// User who follows another user
User.hasMany(Follow, {
    as: "Following",
    foreignKey: {
        name: "followerId",
        allowNull: false
    },
    onDelete: "CASCADE"
});

Follow.belongsTo(User, {
    as: "Follower",
    foreignKey: {
        name: "followerId",
        allowNull: false
    }
});

// User being followed
User.hasMany(Follow, {
    as: "Followers",
    foreignKey: {
        name: "followingId",
        allowNull: false
    },
    onDelete: "CASCADE"
});

Follow.belongsTo(User, {
    as: "FollowingUser",
    foreignKey: {
        name: "followingId",
        allowNull: false
    }
});

module.exports = Follow;
