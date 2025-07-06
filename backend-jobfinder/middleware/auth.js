const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Auth middleware - Token:", token ? "present" : "missing");

    if (!token) {
      return res.status(401).json({ message: "Токен не предоставлен" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth middleware - Decoded token:", decoded);

    const user = await User.findById(decoded.userId);
    console.log(
      "Auth middleware - User found:",
      user ? user.email : "not found"
    );

    if (!user) {
      return res.status(401).json({ message: "Пользователь не найден" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(401).json({ message: "Недействительный токен" });
  }
};

module.exports = auth;
