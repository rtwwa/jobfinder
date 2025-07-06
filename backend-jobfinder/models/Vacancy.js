const mongoose = require("mongoose");

const vacancySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: String,
      required: true,
    },
    responsibilities: {
      type: String,
      required: true,
    },
    keywords: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    salaryMin: {
      type: Number,
      default: null,
    },
    salaryMax: {
      type: Number,
      default: null,
    },
    workFormat: {
      type: String,
      enum: ["remote", "office", "hybrid"],
      required: true,
    },
    schedule: {
      type: String,
      enum: ["fulltime", "parttime", "flexible"],
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

vacancySchema.index({ lat: 1, lng: 1 });

module.exports = mongoose.model("Vacancy", vacancySchema);
