const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const socketIo = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const {
  router: vacancyRoutes,
  setIO: setVacancyIO,
} = require("./routes/vacancies");
const {
  router: messageRoutes,
  setIO: setMessageIO,
} = require("./routes/messages");
const { setupSocket } = require("./ws/socket");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/jobfinder";
console.log("Connecting to MongoDB:", dbUrl);

mongoose
  .connect(dbUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vacancies", vacancyRoutes);
app.use("/api/messages", messageRoutes);

setupSocket(io);
setMessageIO(io);
setVacancyIO(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
