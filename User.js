
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },

    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "user"
    },

    status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "approved"
},

    // Short user biography
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },

    // Profile photo URL
    profileImage: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = User;
