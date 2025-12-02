const mongoose = require("mongoose");
const express = require('express');
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: 2,
      maxlength: 50,
      trim: true
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    phone: {
      type: String,
      match: [/^[0-9]{10}$/, "Phone number must be 10 digits"]
    }
  },
  { timestamps: true }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
