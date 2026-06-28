import User from '../models/User.model.js';
import {
  generateToken,
  generateRefreshToken,
  verifyToken,
} from '../utils/generateToken.js';
import { setTokenCookie, clearTokenCookie } from '../utils/setCookie.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Register
export const register = async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email and password are required', 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'User already exists with this email', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      image: image || '',
      role: 'user',
      isBlocked: false,
      isPremium: false,
    });

    await user.save();

    return successResponse(res, 'Registration successful! Please login.', null, 201);
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // Check if blocked
    if (user.isBlocked) {
      return errorResponse(res, 'Your account has been blocked', 403);
    }

    // Generate token
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    setTokenCookie(res, token);

    const userData = user.toObject();
    delete userData.password;

    return successResponse(res, 'Login successful', {
      user: userData,
      token,
      refreshToken,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Google Login
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return errorResponse(res, 'Google credential is required', 400);
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: name || 'User',
        email,
        image: picture || '',
        role: 'user',
        isBlocked: false,
        isPremium: false,
        googleId: googleId,
      });
      await user.save();
    } else if (user.isBlocked) {
      return errorResponse(res, 'Your account has been blocked', 403);
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    setTokenCookie(res, token);

    const userData = user.toObject();
    delete userData.password;

    return successResponse(res, 'Google login successful', {
      user: userData,
      token,
      refreshToken,
    });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Logout
export const logout = async (req, res) => {
  try {
    clearTokenCookie(res);
    return successResponse(res, 'Logout successful');
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, 'User fetched successfully', { user });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};

// ✅ Refresh Token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorResponse(res, 'Refresh token required', 400);
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user || user.isBlocked) {
      return errorResponse(res, 'User not found or blocked', 401);
    }

    const newToken = generateToken(user);
    setTokenCookie(res, newToken);

    return successResponse(res, 'Token refreshed', { token: newToken });
  } catch (error) {
    return errorResponse(res, error.message, 500);
  }
};