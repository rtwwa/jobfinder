const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({ message: "Ошибка конфигурации сервера" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Пользователь с таким email уже существует" });
    }

    const user = new User({
      name,
      email,
      password,
      role,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({ message: "Ошибка конфигурации сервера" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Неверный email или пароль" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Неверный email или пароль" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
});

router.get("/me", auth, async (req, res) => {
  console.log("GET /me - User authenticated:", req.user.email);
  res.json(req.user);
});

router.put("/interests", auth, async (req, res) => {
  try {
    const { interests } = req.body;

    if (!Array.isArray(interests)) {
      return res
        .status(400)
        .json({ message: "Интересы должны быть массивом строк" });
    }

    req.user.interests = interests;
    await req.user.save();

    res.json({ message: "Интересы обновлены", interests: req.user.interests });
  } catch (error) {
    console.error("Error updating interests:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/keywords", async (req, res) => {
  try {
    const popularKeywords = [
      "JavaScript",
      "React",
      "Vue",
      "Angular",
      "Node.js",
      "Python",
      "Java",
      "C++",
      "C#",
      "PHP",
      "HTML",
      "CSS",
      "TypeScript",
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "GCP",
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "Redis",
      "GraphQL",
      "REST API",
      "Microservices",
      "DevOps",
      "CI/CD",
      "Git",
      "Linux",
      "Windows",
      "iOS",
      "Android",
      "Flutter",
      "React Native",
      "Swift",
      "Kotlin",
      "Machine Learning",
      "AI",
      "Data Science",
      "Analytics",
      "Business Intelligence",
      "Project Management",
      "Agile",
      "Scrum",
      "UX/UI",
      "Design",
      "Marketing",
      "Sales",
      "Customer Support",
      "HR",
      "Finance",
      "Legal",
      "Education",
      "Healthcare",
      "E-commerce",
      "Fintech",
      "Edtech",
      "Medtech",
      "Startup",
      "Enterprise",
      "Remote",
      "Freelance",
      "Full-time",
      "Part-time",
      "Internship",
    ];

    res.json({ keywords: popularKeywords });
  } catch (error) {
    console.error("Error getting keywords:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = router;
