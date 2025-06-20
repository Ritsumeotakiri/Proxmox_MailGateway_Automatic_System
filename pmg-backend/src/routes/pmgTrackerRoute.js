import express from 'express';
import {
  getTracker,
  getMailCount,
  getQuarantineByType,
  getAllQuarantine,
  quarantineAction,
  quarantineActionById,
  getStatByType
} from '../controllers/pmgController.js';

const router = express.Router();

// Tracker & Mail Count
router.get('/tracker', getTracker);
router.get('/mailcount', getMailCount);

// Quarantine
router.get('/quarantine/spam', getQuarantineByType('spam'));
router.get('/quarantine/virus', getQuarantineByType('virus'));
router.get('/quarantine/all', getAllQuarantine);
router.post('/quarantine/action', quarantineAction);
router.post('/quarantine/:id/deliver', quarantineActionById('deliver'));
router.post('/quarantine/:id/delete', quarantineActionById('delete'));

// Statistics
router.get('/statistics/sender', getStatByType('sender'));
router.get('/statistics/receiver', getStatByType('receiver'));
router.get('/spamscore', getStatByType('spamscores'));

export default router;
