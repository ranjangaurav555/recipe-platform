
const User = require("../models/User");
const Recipe = require("../models/Recipe");
const Favorite = require("../models/Favorite");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// USER SIGNUP
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            where: { email: normalizedEmail }
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Signup error:", error.message);

        return res.status(500).json({
            message: "Unable to register user"
        });
    }
};

// USER LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({
            where: { email: email.trim().toLowerCase() }
        });
        if (user && user.status === "banned") {
    return res.status(403).json({
        message: "Your account has been banned."
    });
}

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from environment");
            return res.status(500).json({
                message: "Server configuration error"
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Unable to login"
        });
    }
};

// GET MY PROFILE, CONTRIBUTED RECIPES AND FAVORITES
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: [
                "id",
                "name",
                "email",
                "role",
                "bio",
                "profileImage",
                "createdAt",
                "updatedAt"
            ]
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Get recipes created by this user
        const contributedRecipes = await Recipe.findAll({
            where: { userId: user.id },
            order: [["createdAt", "DESC"]]
        });

        // Get recipes added to this user's favorites
        const favoriteRecords = await Favorite.findAll({
            where: { userId: user.id },
            include: [
                {
                    model: Recipe,
                    include: [
                        {
                            model: User,
                            attributes: ["id", "name"]
                        }
                    ]
                }
            ],
            order: [["createdAt", "DESC"]]
        });

        const favoriteRecipes = favoriteRecords
            .filter((favorite) => favorite.Recipe)
            .map((favorite) => favorite.Recipe);

        return res.status(200).json({
            message: "Profile fetched successfully",
            user,
            contributedRecipes,
            favoriteRecipes
        });
    } catch (error) {
        console.error("Get profile error:", error);

        return res.status(500).json({
            message: "Unable to fetch profile"
        });
    }
};

// UPDATE MY PROFILE
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const { name, bio, profileImage } = req.body;
        const updates = {};

        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({
                    message: "Name cannot be empty"
                });
            }

            updates.name = name.trim();
        }

        if (bio !== undefined) {
            if (typeof bio !== "string") {
                return res.status(400).json({
                    message: "Bio must be text"
                });
            }

            updates.bio = bio.trim();
        }

        if (profileImage !== undefined) {
            if (
                profileImage !== null &&
                typeof profileImage !== "string"
            ) {
                return res.status(400).json({
                    message: "Profile image must be a URL string or null"
                });
            }

            updates.profileImage = profileImage;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "Provide name, bio or profileImage to update"
            });
        }

        await user.update(updates);

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                bio: user.bio,
                profileImage: user.profileImage,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error("Update profile error:", error);

        return res.status(500).json({
            message: "Unable to update profile"
        });
    }
};
