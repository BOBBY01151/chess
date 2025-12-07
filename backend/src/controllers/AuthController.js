import AuthService from '../services/AuthService.js';

class AuthController {
  async register(req, res) {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const result = await AuthService.register(username, email, password);
      res.status(201).json(result);
    } catch (error) {
      console.error('Registration error:', error);
      // Check error type to return appropriate status
      if (error.name === 'MongoServerError' || error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await AuthService.getUserById(req.user._id);
      res.json({ user });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

export default new AuthController();

