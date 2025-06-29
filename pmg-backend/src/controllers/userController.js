import { useBeforeUnload } from "react-router-dom";
import user from "../model/user.js";

// Get all users
export async function getAllUsers(req, res) {
  try {
    const users = await user.find({}, '-password'); // Use projection as second arg
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Get user by ID
export async function getUserById(req, res) {
  try {
    const user = await useBeforeUnloadser.findById(req.params.id, '-password'); // Use projection as second arg
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}