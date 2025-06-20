import express from 'express';
import { getPmgAxios } from '../pmg/pmgClient.js';

const router = express.Router();

/**
 * GET /api/pmg/block-allow
 * List all block/allow groups (e.g., Blacklist, Whitelist)
 */
router.get('/', async (req, res) => {
  try {
    const pmgAxios = await getPmgAxios();
    const response = await pmgAxios.get('/config/ruledb/who');
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Failed to fetch rule groups:', error.message);
    res.status(500).json({ error: 'Failed to fetch rule groups' });
  }
});

/**
 * GET /api/pmg/block-allow/group/:groupid
 * Get all entries inside a specific rule group
 */
router.get('/group/:groupid', async (req, res) => {
  const { groupid } = req.params;
  try {
    const pmgAxios = await getPmgAxios();
    const response = await pmgAxios.get(`/config/ruledb/who/${groupid}/objects`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(`Failed to fetch group ${groupid}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch group members' });
  }
});

/**
 * DELETE /api/pmg/block-allow/:id
 * Delete an entry by ID
 */
router.delete('/:groupid/:id', async (req, res) => {
  const { groupid, id } = req.params;

  try {
    const pmgAxios = await getPmgAxios();
    await pmgAxios.delete(`/config/ruledb/who/${groupid}/objects/${id}`);
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Failed to delete entry:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to delete entry' });
  }
});


/**
 * GET /api/pmg/block-allow/quarantine/blacklist?pmail=user@example.com
 * Get quarantine-level blacklist entries for a specific user
 */
router.get('/quarantine/blacklist', async (req, res) => {
  const pmail = req.query.pmail;

  if (!pmail) {
    return res.status(400).json({ error: 'Missing required query param: pmail' });
  }

  try {
    const pmgAxios = await getPmgAxios();
    const response = await pmgAxios.get('/quarantine/blacklist', {
      params: { pmail }
    });
    res.status(200).json(response.data);
  } catch (err) {
    console.error('Failed to get quarantine blacklist:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch quarantine blacklist',
      details: err.response?.data || err.message,
    });
  }
});

/**
 * GET /api/pmg/block-allow/quarantine/whitelist?pmail=user@example.com
 * Get quarantine-level whitelist entries for a specific user
 */
router.get('/quarantine/whitelist', async (req, res) => {
  const pmail = req.query.pmail;

  if (!pmail) {
    return res.status(400).json({ error: 'Missing required query param: pmail' });
  }

  try {
    const pmgAxios = await getPmgAxios();
    const response = await pmgAxios.get('/quarantine/whitelist', {
      params: { pmail }
    });
    res.status(200).json(response.data);
  } catch (err) {
    console.error('Failed to get quarantine whitelist:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch quarantine whitelist',
      details: err.response?.data || err.message,
    });
  }
});

/**
 * GET /api/pmg/block-allow/list
 * Return all entries in Blacklist and Whitelist
 */
router.get('/list', async (req, res) => {
  try {
    const pmgAxios = await getPmgAxios();

    // Step 1: Fetch all rule groups
    const groupRes = await pmgAxios.get('/config/ruledb/who');
    const groups = groupRes.data.data;

    // Find IDs for Blacklist and Whitelist
    const blacklistGroup = groups.find(g => g.name.toLowerCase() === 'blacklist');
    const whitelistGroup = groups.find(g => g.name.toLowerCase() === 'whitelist');

    if (!blacklistGroup || !whitelistGroup) {
      return res.status(404).json({ error: 'Missing blacklist or whitelist group' });
    }

    // Step 2: Fetch entries from both groups
    const [blacklistRes, whitelistRes] = await Promise.all([
      pmgAxios.get(`/config/ruledb/who/${blacklistGroup.id}/objects`),
      pmgAxios.get(`/config/ruledb/who/${whitelistGroup.id}/objects`)
    ]);

    res.status(200).json({
      blacklist: blacklistRes.data.data || [],
      whitelist: whitelistRes.data.data || []
    });

  } catch (error) {
    console.error('Failed to fetch blacklist/whitelist entries:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch black/white list',
      details: error.response?.data || error.message
    });
  }
});

/**
 * POST /api/pmg/block-allow
 * Add a new entry to the correct group by name
 */
router.post('/', async (req, res) => {
  const { value, type, otype } = req.body;

  if (!value || !type || !otype) {
    return res.status(400).json({ error: 'Missing value, type, or otype' });
  }

  const otypePathMap = {
    email: 'email',
    domain: 'domain',
    ip: 'ip',
    network: 'network',
    regex: 'regex',
    ldapgroup: 'ldapgroup',
    ldapuser: 'ldapuser',
  };

  const path = otypePathMap[otype.toLowerCase()];
  if (!['blacklist', 'whitelist'].includes(type.toLowerCase()) || !path) {
    return res.status(400).json({ error: 'Invalid list type or entry type' });
  }

  try {
    const pmgAxios = await getPmgAxios();

    // Get exact group ID from name
    const groupRes = await pmgAxios.get('/config/ruledb/who');
    const groups = groupRes.data.data;

    const group = groups.find(g => g.name.toLowerCase() === type.toLowerCase());
    if (!group) return res.status(404).json({ error: `${type} group not found` });

    const payload = { [path]: value };

    const response = await pmgAxios.post(`/config/ruledb/who/${group.id}/${path}`, payload);

    res.status(201).json({ message: `Entry added to ${type}`, result: response.data });
  } catch (err) {
    console.error('❌ Failed to add rule:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: 'Failed to add entry',
      details: err.response?.data || err.message
    });
  }
});
/**
 * PUT /api/pmg/block-allow/:ogroup/:id
 * Update an entry in Blacklist or Whitelist by ID
 * Body: { value, otype }
 */
router.put('/:ogroup/:id', async (req, res) => {
  const { ogroup, id } = req.params;
  const { value, otype } = req.body;

  const otypePathMap = {
    email: 'email',
    domain: 'domain',
    ip: 'ip',
    network: 'network',
    regex: 'regex',
    ldapgroup: 'ldapgroup',
    ldapuser: 'ldapuser',
  };

  const path = otypePathMap[otype?.toLowerCase()];
  if (!path || !value) {
    return res.status(400).json({ error: 'Missing or invalid value/otype' });
  }

  try {
    const pmgAxios = await getPmgAxios();
    const payload = { [path]: value };

    const url = `/config/ruledb/who/${ogroup}/${path}/${id}`; // ✅ correct endpoint
    const response = await pmgAxios.put(url, payload);

    res.status(200).json({
      message: 'Entry updated successfully via correct PUT route',
      result: response.data,
    });
  } catch (error) {
    console.error('❌ Failed to update rule:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to update rule entry',
      details: error.response?.data || error.message
    });
  }
});



export default router;
