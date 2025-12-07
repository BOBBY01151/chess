import User from '../models/User.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';

class AuthService {
  async register(username, email, password) {
    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();
    
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    return {
      user: user.toJSON(),
      token,
      refreshToken
    };
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    return {
      user: user.toJSON(),
      token,
      refreshToken
    };
  }

  async getUserById(userId) {
    return await User.findById(userId);
  }
}

export default new AuthService();

