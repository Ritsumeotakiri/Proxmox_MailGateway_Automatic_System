import express from 'express';
import {
  getQuarantineSettings,
  updateQuarantineSettings,
} from '../controllers/settingController.js';

const router = express.Router();

router.get('/quarantine-settings', getQuarantineSettings);
router.put('/quarantine-settings', updateQuarantineSettings);

export default router;
