import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    //check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    //create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          token: generateToken(user._id),
        },
        message: "User registered successfully",
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Login User
// @route   POST /api/users/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    //check if user exists
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          createdAt: user.createdAt,
          token: generateToken(user._id),
        },
        message: "User logged in successfully",
      });
    } else {
      return next(new AppError("Invalid email or password", 401));
    }
  } catch (error) {
    next(error);
  }
};

//@desc get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      data: user,
      message: "User profile fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

//@desc change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    if (!currentPassword || !newPassword) {
      return next(
        new AppError("Please provide both current and new password", 400),
      );
    }

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      // 400, not 401: the session is valid, the frontend logs out on 401
      return next(new AppError("Current password is incorrect", 400));
    }

    if (await user.matchPassword(newPassword)) {
      return next(
        new AppError("New password must be different from the current one", 400),
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

//@desc update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, profileImage } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    const { password, ...userData } = user.toObject();
    res.status(200).json({
      success: true,
      data: userData,
      message: "User profile updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
