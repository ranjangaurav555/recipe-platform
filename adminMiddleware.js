
// Check whether the logged-in user is an admin
const adminMiddleware = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin only."
            });
        }

        next();
    } catch (error) {
        console.error("Admin middleware error:", error);

        return res.status(500).json({
            message: "Unable to verify admin access"
        });
    }
};

module.exports = adminMiddleware;
