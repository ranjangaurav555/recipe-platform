
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
require("./models/Favorite");
const reviewRoutes = require("./routes/reviewRoutes");
require("./models/Review");
const followRoutes = require("./routes/followRoutes");
require("./models/Follow");
const activityRoutes = require("./routes/activityRoutes");
const adminRoutes = require("./routes/adminRoutes");
const collectionRoutes = require("./routes/collectionRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.get("/", (req, res) => {
    res.redirect("/login.html");
});
app.get("/home", (req, res) => {
    res.sendFile(require("path").join(__dirname, "public", "index.html"));
});
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("Recipe Management API is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/follows", followRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/collections", collectionRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log("PostgreSQL connected successfully!");

        await sequelize.sync();
        console.log("Database tables created successfully!");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Startup error:", error.message);
    }
}

startServer();
