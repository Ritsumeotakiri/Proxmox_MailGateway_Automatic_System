import express from 'express';
import { archivePmgLogs } from '../controllers/pmgArchiveController.js';

const router = express.Router();

router.get('/archive', archivePmgLogs); 

export default router;
