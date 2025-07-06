const mongoose = require("mongoose");
const User = require("./models/User");
const Vacancy = require("./models/Vacancy");
require("dotenv").config();

const sampleUsers = [
  {
    name: "Иван Петров",
    email: "ivan@example.com",
    password: "password123",
    role: "jobseeker",
    location: { lat: 55.7558, lng: 37.6176 },
    preferences: {
      salaryMin: 50000,
      salaryMax: 150000,
      workFormat: "hybrid",
      schedule: "fulltime",
    },
    interests: [
      "React",
      "JavaScript",
      "TypeScript",
      "Frontend",
      "Web Development",
    ],
  },
  {
    name: "Мария Сидорова",
    email: "maria@example.com",
    password: "password123",
    role: "jobseeker",
    location: { lat: 55.7517, lng: 37.6178 },
    preferences: {
      salaryMin: 80000,
      salaryMax: 200000,
      workFormat: "remote",
      schedule: "flexible",
    },
    interests: ["Python", "Machine Learning", "Data Science", "AI", "Backend"],
  },
  {
    name: "Алексей Козлов",
    email: "alex@example.com",
    password: "password123",
    role: "employer",
    location: { lat: 55.7539, lng: 37.6208 },
  },
  {
    name: "Елена Волкова",
    email: "elena@example.com",
    password: "password123",
    role: "employer",
    location: { lat: 55.75, lng: 37.62 },
  },
];

const sampleVacancies = [
  {
    title: "Frontend Developer",
    company: "TechCorp",
    description:
      "Ищем опытного Frontend разработчика для работы над современными веб-приложениями.",
    requirements: "React, JavaScript, TypeScript, 3+ года опыта",
    responsibilities:
      "Разработка пользовательских интерфейсов, оптимизация производительности",
    location: "Москва, центр",
    lat: 55.7558,
    lng: 37.6176,
    salaryMin: 120000,
    salaryMax: 200000,
    workFormat: "hybrid",
    schedule: "fulltime",
    employer: "alex@example.com",
    keywords: [
      "React",
      "JavaScript",
      "TypeScript",
      "Frontend",
      "Web Development",
    ],
  },
  {
    title: "Backend Developer",
    company: "DataSoft",
    description:
      "Требуется Backend разработчик для создания масштабируемых API.",
    requirements: "Node.js, MongoDB, Express, 2+ года опыта",
    responsibilities:
      "Разработка API, работа с базой данных, интеграция сервисов",
    location: "Москва, САО",
    lat: 55.8518,
    lng: 37.5176,
    salaryMin: 150000,
    salaryMax: 250000,
    workFormat: "office",
    schedule: "fulltime",
    employer: "elena@example.com",
    keywords: ["Node.js", "MongoDB", "Express", "Backend", "API"],
  },
  {
    title: "UI/UX Designer",
    company: "DesignStudio",
    description:
      "Создаем красивые и функциональные интерфейсы для мобильных и веб-приложений.",
    requirements: "Figma, Adobe Creative Suite, понимание UX принципов",
    responsibilities:
      "Создание макетов, прототипирование, тестирование интерфейсов",
    location: "Москва, ЮЗАО",
    lat: 55.6558,
    lng: 37.5176,
    salaryMin: 80000,
    salaryMax: 150000,
    workFormat: "remote",
    schedule: "flexible",
    employer: "alex@example.com",
  },
  {
    title: "DevOps Engineer",
    company: "CloudTech",
    description:
      "Настраиваем и поддерживаем инфраструктуру для высоконагруженных систем.",
    requirements: "Docker, Kubernetes, AWS, CI/CD, 3+ года опыта",
    responsibilities:
      "Настройка мониторинга, автоматизация деплоя, обеспечение безопасности",
    location: "Москва, ВАО",
    lat: 55.7558,
    lng: 37.7176,
    salaryMin: 200000,
    salaryMax: 350000,
    workFormat: "hybrid",
    schedule: "fulltime",
    employer: "elena@example.com",
  },
  {
    title: "QA Engineer",
    company: "TestPro",
    description:
      "Обеспечиваем качество продукта через автоматизированное и ручное тестирование.",
    requirements: "Selenium, Postman, понимание методологий тестирования",
    responsibilities:
      "Написание тест-кейсов, автоматизация тестов, баг-репорты",
    location: "Москва, ЗАО",
    lat: 55.7558,
    lng: 37.4176,
    salaryMin: 70000,
    salaryMax: 120000,
    workFormat: "office",
    schedule: "fulltime",
    employer: "alex@example.com",
  },
  {
    title: "Python Developer",
    company: "DataLab",
    description:
      "Разрабатываем решения для анализа больших данных и машинного обучения.",
    requirements: "Python, Django, PostgreSQL, 2+ года опыта",
    responsibilities:
      "Разработка API, работа с базами данных, интеграция ML моделей",
    location: "Казань, центр",
    lat: 55.7887,
    lng: 49.1221,
    salaryMin: 100000,
    salaryMax: 180000,
    workFormat: "hybrid",
    schedule: "fulltime",
    employer: "elena@example.com",
    keywords: [
      "Python",
      "Django",
      "PostgreSQL",
      "Machine Learning",
      "Data Science",
    ],
  },
  {
    title: "React Native Developer",
    company: "MobileTech",
    description:
      "Создаем мобильные приложения для iOS и Android с использованием React Native.",
    requirements: "React Native, JavaScript, Redux, 1+ год опыта",
    responsibilities:
      "Разработка мобильных приложений, оптимизация производительности",
    location: "Санкт-Петербург, центр",
    lat: 59.9311,
    lng: 30.3609,
    salaryMin: 120000,
    salaryMax: 200000,
    workFormat: "remote",
    schedule: "flexible",
    employer: "alex@example.com",
  },
];

async function seed() {
  try {
    await mongoose.connect(
      process.env.DB_URL || "mongodb://localhost:27017/jobfinder"
    );
    console.log("Connected to MongoDB");

    await User.deleteMany({});
    await Vacancy.deleteMany({});

    console.log("Cleared existing data");

    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User({
        ...userData,
        lastVacancyCheck: new Date(Date.now() - 24 * 60 * 60 * 1000),
      });
      await user.save();
      createdUsers.push(user);
      console.log(
        `Created user: ${user.email} (password hashed: ${
          user.password !== userData.password
        })`
      );
    }
    console.log("Created users:", createdUsers.length);

    const employers = createdUsers.filter((user) => user.role === "employer");
    const employerMap = {};
    employers.forEach((emp) => {
      employerMap[emp.email] = emp._id;
    });

    const createdVacancies = [];
    for (const vacancyData of sampleVacancies) {
      const employerId = employerMap[vacancyData.employer];
      if (!employerId) {
        console.error(`Employer not found for email: ${vacancyData.employer}`);
        continue;
      }

      const { employer, ...vacancyFields } = vacancyData;
      const vacancy = new Vacancy({
        ...vacancyFields,
        employer: employerId,
      });

      await vacancy.save();
      createdVacancies.push(vacancy);
      console.log(
        `Created vacancy: ${vacancy.title} for employer: ${vacancyData.employer}`
      );
    }
    console.log("Created vacancies:", createdVacancies.length);

    const jobseekers = createdUsers.filter((user) => user.role === "jobseeker");

    const frontendVacancy = createdVacancies.find(
      (v) => v.title === "Frontend Developer"
    );
    if (frontendVacancy && jobseekers[0]) {
      frontendVacancy.applicants.push(jobseekers[0]._id);
      await frontendVacancy.save();
      console.log(
        `${jobseekers[0].name} откликнулся на ${frontendVacancy.title}`
      );
    }

    const backendVacancy = createdVacancies.find(
      (v) => v.title === "Backend Developer"
    );
    if (backendVacancy && jobseekers[1]) {
      backendVacancy.applicants.push(jobseekers[1]._id);
      await backendVacancy.save();
      console.log(
        `${jobseekers[1].name} откликнулась на ${backendVacancy.title}`
      );
    }

    const designerVacancy = createdVacancies.find(
      (v) => v.title === "UI/UX Designer"
    );
    if (designerVacancy && jobseekers[0]) {
      designerVacancy.applicants.push(jobseekers[0]._id);
      await designerVacancy.save();
      console.log(
        `${jobseekers[0].name} откликнулся на ${designerVacancy.title}`
      );
    }

    console.log("Seed completed successfully!");
    console.log("\nTest accounts:");
    console.log("Jobseekers:");
    console.log("- ivan@example.com / password123");
    console.log("- maria@example.com / password123");
    console.log("\nEmployers:");
    console.log("- alex@example.com / password123");
    console.log("- elena@example.com / password123");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
