import express from 'express';
import {
  listRuleGroups,
  getGroupEntries,
  getQuarantineBlacklist,
  getQuarantineWhitelist,
  listBlackWhite,
  addEntry,
  updateEntry,
  deleteEntry
} from '../controllers/blockAllowController.js';

import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// Protect all routes
router.use(verifyToken);

// Route: List all rule groups
router.get('/', listRuleGroups);

// Route: Get entries from a specific group
router.get('/group/:groupid', getGroupEntries);

// Route: Get quarantine blacklist for a specific email
router.get('/quarantine/blacklist', getQuarantineBlacklist);

// Route: Get quarantine whitelist for a specific email
router.get('/quarantine/whitelist', getQuarantineWhitelist);

// Route: Get combined list of blacklist and whitelist entries
router.get('/list', listBlackWhite);

// Route: Add a new entry to blacklist or whitelist
router.post('/', addEntry);

// Route: Update an entry in blacklist or whitelist
router.put('/:ogroup/:id', updateEntry);

// Route: Delete an entry by group and ID
router.delete('/:groupid/:id', deleteEntry);

export default router;
