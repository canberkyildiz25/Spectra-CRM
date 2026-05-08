import { Request, Response } from 'express';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, firstName, lastName, role } = req.body;

    // Validation
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email or username already exists'
      });
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role: role || 'user'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      data: {
        token,
        user: userResponse
      },
      message: 'User registered successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Find user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User account is inactive'
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      data: {
        token,
        user: userResponse
      },
      message: 'Login successful'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  // JWT is stateless, so logout is just on client side
  // But we can invalidate the token if needed

  res.json({
    success: true,
    message: 'Logout successful'
  });
};
