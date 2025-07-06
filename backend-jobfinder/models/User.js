const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["jobseeker", "employer"],
      required: true,
    },
    location: {
      type: {
        lat: Number,
        lng: Number,
      },
      default: null,
    },
    preferences: {
      salaryMin: Number,
      salaryMax: Number,
      workFormat: {
        type: String,
        enum: ["remote", "office", "hybrid"],
      },
      schedule: {
        type: String,
        enum: ["fulltime", "parttime", "flexible"],
      },
    },
    interests: {
      type: [String],
      default: [],
    },
    lastVacancyCheck: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
