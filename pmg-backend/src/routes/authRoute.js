import express from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser
} from '../controllers/authController.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', verifyToken, getCurrentUser);

export default router;
