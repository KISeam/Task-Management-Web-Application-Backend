const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

// Create a User
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please provide all required fields (name, email, password)");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  const newUser = await User.create({ name, email, password });
  res.status(201).json({
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
  });
});

// Login a user
const loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", { email, password });
  const findUser = await User.findOne({ email });
  if (!findUser) {
    console.log("User not found:", email);
    res.status(401);
    throw new Error("Invalid Credentials");
  }
  const passwordMatch = await findUser.isPasswordMatch(password);
  console.log("Password match:", passwordMatch);
  if (passwordMatch) {
    const refreshToken = await generateRefreshToken(findUser._id);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findUser._id,
      name: findUser.name,
      email: findUser.email,
      token: generateToken(findUser._id),
    });
  } else {
    console.log("Password mismatch for:", email);
    res.status(401);
    throw new Error("Invalid Credentials");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, oldPassword, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isPasswordMatch = await user.isPasswordMatch(oldPassword);
  if (!isPasswordMatch) {
    return res.status(400).json({ message: "Old password is incorrect" });
  }

  user.password = newPassword; // Let pre-save middleware handle hashing
  await user.save();

  res.status(200).json({ message: "Password reset successfully" });
});


const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  res.status(200).json({ message: "Logged out successfully" });
});


const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (user) {
    res.json({ user });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

module.exports = {
  createUser,
  resetPassword,
  loginUserCtrl,
  logoutUser,
  getUserProfile,
};