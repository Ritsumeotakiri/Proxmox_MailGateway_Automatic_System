import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../model/user.js';
import { getPmgAxios } from '../pmg/pmgClient.js';


dotenv.config();
const SECRET = process.env.JWT_SECRET;

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  console.log('Register attempt:', { username, email });

  try {
    const existing = await User.findOne({ username });
    if (existing) {
      console.log('Registration failed: username already exists');
      return res.status(409).json({ message: 'Username already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashed });
    await newUser.save();

    console.log('Registration successful for user:', username);
    res.json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: err.message });
  }
};


export const loginUser = async (req, res) => {
  const { username, password } = req.body;
  console.log('Login attempt for user:', username);

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log('Login failed: user not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log('Login failed: incorrect password');
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, SECRET, {
      expiresIn: '1d',
    });

    console.log('Login successful for user:', username);

    // 🔥 Emit WebSocket tracker:update
    try {
      const pmg = await getPmgAxios();
      const { data } = await pmg.get('/nodes/pmg/tracker');
      const io = req.app.get('io');
      io.emit('tracker:update', data.data);
      console.log('📤 Emitting tracker:update after login:', data.data.length);
    } catch (e) {
      console.warn('⚠ Failed to emit tracker:update:', e.message);
    }

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: err.message });
  }
};


export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const initials = user.username
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase();

    res.json({
      fullName: user.username,
      email: user.email,
      initials,
      firstName: user.username.split(' ')[0]
    });
  } catch (err) {
    console.error('Get current user error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};