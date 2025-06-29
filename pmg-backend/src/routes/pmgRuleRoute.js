import express from 'express';
import {
  getAllRules,
  createRule,
  deleteRule
} from '../controllers/pmgRuleController.js';

const router = express.Router();

router.get('/', getAllRules);
router.post('/', createRule);
router.delete('/:id', deleteRule);


export default router;