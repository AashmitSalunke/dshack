const mongoose = require("mongoose");
const express = require('express');

const issueSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: [true, "Issue title is required"],
      minlength: 5,
      maxlength: 100,
      trim: true
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: 10,
      maxlength: 1000
    },

    category: {
      type: String,
      required: true,
      enum: [
        "pothole",
        "garbage",
        "water_leakage",
        "streetlight",
        "public_safety",
        "infrastructure_damage",
        "other"
      ]
    },

    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved"],
      default: "pending"
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    imageUrl: {
      type: String,
      default:
        "https://res.cloudinary.com/demo/image/upload/v123/default_issue.png"
    },

    location: {
      type: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
      },
      required: true
    },

    detectedLabels: {
      type: [String],
      default: []
    },

    assignedTo: {
      type: String,
      enum: ["road_dept", "cleanliness_dept", "water_dept", "electrical_dept", "none"],
      default: "none"
    }
  },
  { timestamps: true }
);

// Geo index for nearby issue searches
issueSchema.index({ "location.latitude": 1, "location.longitude": 1 });

const Issue = mongoose.model("Issue", issueSchema);
module.exports = Issue;
