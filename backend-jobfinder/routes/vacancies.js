const express = require("express");
const Vacancy = require("../models/Vacancy");
const User = require("../models/User");
const auth = require("../middleware/auth");

let io;

function setIO(ioInstance) {
  io = ioInstance;
}

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { salaryMin, salaryMax, workFormat, schedule, location } = req.query;

    let query = { isActive: true };

    if (salaryMin) {
      query.salaryMin = { $gte: parseInt(salaryMin) };
    }

    if (salaryMax) {
      query.salaryMax = { $lte: parseInt(salaryMax) };
    }

    if (workFormat) {
      query.workFormat = workFormat;
    }

    if (schedule) {
      query.schedule = schedule;
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    const vacancies = await Vacancy.find(query)
      .populate("employer", "name email")
      .sort({ createdAt: -1 });

    res.json(vacancies);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res
        .status(403)
        .json({ message: "Только работодатели могут создавать вакансии" });
    }

    const vacancyData = {
      ...req.body,
      employer: req.user._id,
    };

    if (vacancyData.salaryMin) {
      vacancyData.salaryMin = parseInt(vacancyData.salaryMin);
    }
    if (vacancyData.salaryMax) {
      vacancyData.salaryMax = parseInt(vacancyData.salaryMax);
    }
    if (vacancyData.lat) {
      vacancyData.lat = parseFloat(vacancyData.lat);
    }
    if (vacancyData.lng) {
      vacancyData.lng = parseFloat(vacancyData.lng);
    }

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
      "Frontend",
      "Backend",
      "Full Stack",
      "Web Development",
      "Mobile Development",
      "UI Design",
      "UX Design",
      "User Interface",
      "User Experience",
      "Visual Design",
      "Graphic Design",
      "Product Design",
      "Interaction Design",
      "Prototyping",
      "Wireframing",
      "User Research",
      "Usability Testing",
      "Design Systems",
      "Brand Design",
      "Illustration",
      "Animation",
      "3D Design",
      "Print Design",
      "Digital Design",
      "Creative Design",
      "Software Development",
      "Application Development",
      "System Development",
      "Database Design",
      "API Development",
      "Cloud Computing",
      "Server Administration",
      "Network Administration",
      "Security",
      "Testing",
      "QA",
      "Quality Assurance",
      "Automation",
      "Performance",
      "Scalability",
      "Architecture",
      "Infrastructure",
    ];

    const textContent =
      `${vacancyData.title} ${vacancyData.description} ${vacancyData.requirements} ${vacancyData.responsibilities}`.toLowerCase();

    const extractedKeywords = [];

    popularKeywords.forEach((keyword) => {
      if (textContent.includes(keyword.toLowerCase())) {
        extractedKeywords.push(keyword);
      }
    });

    const designKeywords = ["design", "designer", "designing"];
    const hasDesign = designKeywords.some((word) => textContent.includes(word));
    if (hasDesign && !extractedKeywords.includes("Design")) {
      extractedKeywords.push("Design");
    }

    const roleKeywords = {
      Frontend: ["frontend", "front-end", "client-side", "browser"],
      Backend: ["backend", "back-end", "server-side", "api"],
      "Full Stack": ["full stack", "fullstack", "full-stack"],
      "UI/UX": ["ui/ux", "ui ux", "user interface", "user experience", "ux/ui"],
      "Data Science": [
        "data science",
        "data scientist",
        "analytics",
        "machine learning",
        "ml",
        "ai",
      ],
    };

    Object.entries(roleKeywords).forEach(([keyword, synonyms]) => {
      const hasMatch = synonyms.some((synonym) =>
        textContent.includes(synonym)
      );
      if (hasMatch && !extractedKeywords.includes(keyword)) {
        extractedKeywords.push(keyword);
      }
    });

    if (
      extractedKeywords.some((k) =>
        ["React", "Vue", "Angular", "JavaScript", "TypeScript"].includes(k)
      )
    ) {
      if (!extractedKeywords.includes("Frontend")) {
        extractedKeywords.push("Frontend");
      }
    }

    if (
      extractedKeywords.some((k) =>
        ["Node.js", "Python", "Java", "C#", "PHP"].includes(k)
      )
    ) {
      if (!extractedKeywords.includes("Backend")) {
        extractedKeywords.push("Backend");
      }
    }

    vacancyData.keywords = extractedKeywords;

    console.log(
      `📝 Вакансия "${vacancyData.title}" - извлеченные ключевые слова:`,
      extractedKeywords
    );

    const vacancy = new Vacancy(vacancyData);

    await vacancy.save();

    const populatedVacancy = await Vacancy.findById(vacancy._id).populate(
      "employer",
      "name email"
    );

    if (io) {
      const jobseekers = await User.find({ role: "jobseeker" });

      console.log(
        `🔍 Проверяем ${jobseekers.length} соискателей для вакансии "${vacancyData.title}"`
      );

      jobseekers.forEach((jobseeker) => {
        let isRelevant = false;
        let intersection = [];

        if (jobseeker.interests && jobseeker.interests.length > 0) {
          intersection = jobseeker.interests.filter((interest) =>
            extractedKeywords.includes(interest)
          );
          isRelevant = intersection.length > 0;

          console.log(`👤 ${jobseeker.name} (${jobseeker.email}):`);
          console.log(`   Интересы: ${jobseeker.interests.join(", ")}`);
          console.log(`   Совпадения: ${intersection.join(", ")}`);
          console.log(`   Релевантно: ${isRelevant ? "✅" : "❌"}`);
        } else {
          console.log(
            `👤 ${jobseeker.name} (${jobseeker.email}): Нет интересов - получает все уведомления`
          );
        }

        if (
          isRelevant ||
          !jobseeker.interests ||
          jobseeker.interests.length === 0
        ) {
          io.to(`user_${jobseeker._id}`).emit("newVacancy", {
            vacancy: populatedVacancy,
            message: `Новая вакансия: ${populatedVacancy.title} в ${populatedVacancy.company}`,
            isRelevant: isRelevant,
            matchedInterests: intersection,
          });

          console.log(
            `📨 Отправлено уведомление ${jobseeker.name}${
              isRelevant ? " (релевантно)" : " (все уведомления)"
            }`
          );
        } else {
          console.log(
            `🚫 Уведомление НЕ отправлено ${jobseeker.name} - не релевантно`
          );
        }
      });
    }

    res.status(201).json(populatedVacancy);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/:id/apply", auth, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Только соискатели могут откликаться на вакансии" });
    }

    const vacancy = await Vacancy.findById(req.params.id);
    if (!vacancy) {
      return res.status(404).json({ message: "Вакансия не найдена" });
    }

    if (vacancy.applicants.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "Вы уже откликались на эту вакансию" });
    }

    vacancy.applicants.push(req.user._id);
    await vacancy.save();

    res.json({ message: "Отклик успешно отправлен" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/my", auth, async (req, res) => {
  try {
    const vacancies = await Vacancy.find({ employer: req.user._id })
      .populate("applicants", "name email")
      .sort({ createdAt: -1 });

    res.json(vacancies);
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/new-count", auth, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Только соискатели могут проверять новые вакансии" });
    }

    let query = {
      createdAt: { $gt: req.user.lastVacancyCheck },
      isActive: true,
    };

    if (req.user.interests && req.user.interests.length > 0) {
      query.$or = [
        { keywords: { $in: req.user.interests } },
        { title: { $regex: req.user.interests.join("|"), $options: "i" } },
        {
          description: { $regex: req.user.interests.join("|"), $options: "i" },
        },
        {
          requirements: { $regex: req.user.interests.join("|"), $options: "i" },
        },
      ];
    }

    const relevantVacanciesCount = await Vacancy.countDocuments(query);

    res.json({ newCount: relevantVacanciesCount });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.post("/mark-checked", auth, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res
        .status(403)
        .json({ message: "Только соискатели могут отмечать проверку" });
    }

    req.user.lastVacancyCheck = new Date();
    await req.user.save();

    res.json({ message: "Время проверки обновлено" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.get("/relevant", auth, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({
        message: "Только соискатели могут получать релевантные вакансии",
      });
    }

    let query = { isActive: true };

    if (req.user.interests && req.user.interests.length > 0) {
      query.$or = [
        { keywords: { $in: req.user.interests } },
        { title: { $regex: req.user.interests.join("|"), $options: "i" } },
        {
          description: { $regex: req.user.interests.join("|"), $options: "i" },
        },
        {
          requirements: { $regex: req.user.interests.join("|"), $options: "i" },
        },
      ];
    }

    const relevantVacancies = await Vacancy.find(query)
      .populate("employer", "name email")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(relevantVacancies);
  } catch (error) {
    console.error("Error getting relevant vacancies:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res
        .status(403)
        .json({ message: "Только работодатели могут редактировать вакансии" });
    }

    const vacancy = await Vacancy.findById(req.params.id);
    if (!vacancy) {
      return res.status(404).json({ message: "Вакансия не найдена" });
    }

    if (vacancy.employer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Вы можете редактировать только свои вакансии" });
    }

    const updateData = { ...req.body };

    if (updateData.salaryMin) {
      updateData.salaryMin = parseInt(updateData.salaryMin);
    }
    if (updateData.salaryMax) {
      updateData.salaryMax = parseInt(updateData.salaryMax);
    }
    if (updateData.lat) {
      updateData.lat = parseFloat(updateData.lat);
    }
    if (updateData.lng) {
      updateData.lng = parseFloat(updateData.lng);
    }

    const updatedVacancy = await Vacancy.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("employer", "name email");

    res.json(updatedVacancy);
  } catch (error) {
    console.error("Ошибка обновления вакансии:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "employer") {
      return res
        .status(403)
        .json({ message: "Только работодатели могут удалять вакансии" });
    }

    const vacancy = await Vacancy.findById(req.params.id);
    if (!vacancy) {
      return res.status(404).json({ message: "Вакансия не найдена" });
    }

    if (vacancy.employer.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Вы можете удалять только свои вакансии" });
    }

    await Vacancy.findByIdAndDelete(req.params.id);

    res.json({ message: "Вакансия успешно удалена" });
  } catch (error) {
    console.error("Ошибка удаления вакансии:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

module.exports = { router, setIO };
