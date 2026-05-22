// ============================================
// Authentication Controller
// ============================================
// Handles user signup, login, and token management

import User from '../models/User.js';
import { generateToken } from '../utils/tokenUtils.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

// ============================================
// User Registration
// ============================================
export const signup = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword, firstName, lastName } = req.body;
    logger.info(`Signup request received for email=${email} ip=${req.ip}`);

    // Validate input
    if (!username || !email || !password || !confirmPassword) {
      return sendError(res, 'All fields are required', null, 400);
    }

    if (password !== confirmPassword) {
      return sendError(res, 'Passwords do not match', null, 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', null, 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return sendError(res, 'User with this email or username already exists', null, 400);
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    logger.info(`New user registered: ${email}`);

    return sendSuccess(res, {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        theme: user.theme,
      }
    }, 'User registered successfully', 201);

  } catch (error) {
    logger.error(`Signup error: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

// ============================================
// User Login
// ============================================
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    logger.info(`Login request received for email=${email} ip=${req.ip}`);

    // Validate input
    if (!email || !password) {
      return sendError(res, 'Email and password are required', null, 400);
    }

    // Find user and select password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return sendError(res, 'Invalid email or password', null, 401);
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);

    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', null, 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account is inactive', null, 401);
    }

    // Generate token
    const token = generateToken(user._id);

    logger.info(`User logged in: ${email}`);
    logger.debug(`Login token generated for userId=${user._id}`);

    return sendSuccess(res, {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        theme: user.theme,
        preferredModel: user.preferredModel,
        subscriptionPlan: user.subscriptionPlan,
      }
    }, 'Login successful');

  } catch (error) {
    logger.error(`Login error: ${error.message}`, { stack: error.stack });
    next(error);
  }
};

// ============================================
// Get Current User
// ============================================
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return sendError(res, 'User not found', null, 404);
    }

    return sendSuccess(res, {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      theme: user.theme,
      preferredModel: user.preferredModel,
      subscriptionPlan: user.subscriptionPlan,
      apiUsageCount: user.apiUsageCount,
      apiUsageLimit: user.apiUsageLimit,
      isAdmin: user.isAdmin,
    });

  } catch (error) {
    logger.error(`Get user error: ${error.message}`);
    next(error);
  }
};

// ============================================
// Update User Profile
// ============================================
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, theme, preferredModel } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (theme) updateData.theme = theme;
    if (preferredModel) updateData.preferredModel = preferredModel;

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    );

    return sendSuccess(res, { user }, 'Profile updated successfully');

  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    next(error);
  }
};

// ============================================
// Change Password
// ============================================
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return sendError(res, 'All password fields are required', null, 400);
    }

    if (newPassword !== confirmPassword) {
      return sendError(res, 'New passwords do not match', null, 400);
    }

    const user = await User.findById(req.userId).select('+password');

    // Verify current password
    const isPasswordValid = await user.matchPassword(currentPassword);
    if (!isPasswordValid) {
      return sendError(res, 'Current password is incorrect', null, 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    logger.info(`User changed password: ${user.email}`);

    return sendSuccess(res, {}, 'Password changed successfully');

  } catch (error) {
    logger.error(`Change password error: ${error.message}`);
    next(error);
  }
};

// ============================================
// Logout
// ============================================
export const logout = async (req, res, next) => {
  try {
    logger.info(`User logged out: ${req.user.email}`);
    return sendSuccess(res, {}, 'Logout successful');
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    next(error);
  }
};
