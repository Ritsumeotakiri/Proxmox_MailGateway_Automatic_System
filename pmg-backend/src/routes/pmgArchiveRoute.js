import express from 'express';
import { archivePmgLogsHandler } from '../controllers/pmgArchiveController.js';

const router = express.Router();

router.get('/archive', archivePmgLogsHandler); // Optional HTTP trigger

export default router;
