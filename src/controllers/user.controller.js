import User from '../models/User.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ✅ Get All Users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -__v');
    return successResponse(res, 'Users fetched successfully', users);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Get Single User
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password -__v');
    
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    
    return successResponse(res, 'User fetched successfully', user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const { name, image } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (name) user.name = name;
    if (image) user.image = image;

    await user.save();

    const userData = user.toObject();
    delete userData.password;

    return successResponse(res, 'Profile updated successfully', userData);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Block User (Admin only)
export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (user.role === 'admin') {
      return errorResponse(res, 'Cannot block an admin user', 403);
    }

    user.isBlocked = true;
    await user.save();

    return successResponse(res, 'User blocked successfully', user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Unblock User (Admin only)
export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.isBlocked = false;
    await user.save();

    return successResponse(res, 'User unblocked successfully', user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Make Premium (Admin only)
export const makePremium = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.isPremium = true;
    await user.save();

    return successResponse(res, 'User is now premium', user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Get User Statistics
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const totalUsers = await User.countDocuments();
    const totalPremium = await User.countDocuments({ isPremium: true });
    const totalBlocked = await User.countDocuments({ isBlocked: true });

    return successResponse(res, 'User statistics fetched', {
      totalUsers,
      totalPremium,
      totalBlocked,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Change User Role (Admin only)
export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return errorResponse(res, 'Invalid role. Must be "user" or "admin"', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Prevent changing own role
    if (user._id.toString() === req.user.id) {
      return errorResponse(res, 'Cannot change your own role', 403);
    }

    user.role = role;
    await user.save();

    return successResponse(res, 'User role updated successfully', user);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};