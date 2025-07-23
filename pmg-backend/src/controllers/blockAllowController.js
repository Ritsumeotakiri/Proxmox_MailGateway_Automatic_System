import { getPmgAxios } from '../pmg/pmgClient.js';

const handleError = (res, message, error) => {
  console.error(`${message}:`, error.response?.data || error.message);
  res.status(error.response?.status || 500).json({
    error: message,
    details: error.response?.data || error.message,
  });
};

const withPmgAxios = (handler) => async (req, res) => {
  try {
    const pmgAxios = await getPmgAxios();
    await handler(req, res, pmgAxios);
  } catch (error) {
    handleError(res, 'PMG API Error', error);
  }
};

// List rule groups
export const listRuleGroups = withPmgAxios(async (req, res, pmgAxios) => {
  const response = await pmgAxios.get('/config/ruledb/who');
  res.status(200).json(response.data);
});

// Get group entries
export const getGroupEntries = withPmgAxios(async (req, res, pmgAxios) => {
  const { groupid } = req.params;
  const response = await pmgAxios.get(`/config/ruledb/who/${groupid}/objects`);
  res.status(200).json(response.data);
});

// Delete entry
export const deleteEntry = withPmgAxios(async (req, res, pmgAxios) => {
  const { groupid, id } = req.params;
  await pmgAxios.delete(`/config/ruledb/who/${groupid}/objects/${id}`);
  res.status(200).json({ message: 'Entry deleted successfully' });
});

// Quarantine blacklist
export const getQuarantineBlacklist = withPmgAxios(async (req, res, pmgAxios) => {
  const pmail = req.query.pmail;
  if (!pmail) return res.status(400).json({ error: 'Missing query param: pmail' });

  const response = await pmgAxios.get('/quarantine/blacklist', { params: { pmail } });
  res.status(200).json(response.data);
});

// Quarantine whitelist
export const getQuarantineWhitelist = withPmgAxios(async (req, res, pmgAxios) => {
  const pmail = req.query.pmail;
  if (!pmail) return res.status(400).json({ error: 'Missing query param: pmail' });

  const response = await pmgAxios.get('/quarantine/whitelist', { params: { pmail } });
  res.status(200).json(response.data);
});

// List blacklist and whitelist entries
export const listBlackWhite = withPmgAxios(async (req, res, pmgAxios) => {
  const groupRes = await pmgAxios.get('/config/ruledb/who');
  const groups = groupRes.data.data;

  const blacklist = groups.find(g => g.name.toLowerCase() === 'blacklist');
  const whitelist = groups.find(g => g.name.toLowerCase() === 'whitelist');

  if (!blacklist || !whitelist)
    return res.status(404).json({ error: 'Missing group' });

  const [blacklistRes, whitelistRes] = await Promise.all([
    pmgAxios.get(`/config/ruledb/who/${blacklist.id}/objects`),
    pmgAxios.get(`/config/ruledb/who/${whitelist.id}/objects`)
  ]);

  res.status(200).json({
    blacklist: blacklistRes.data.data || [],
    whitelist: whitelistRes.data.data || []
  });
});

// Add entry to blacklist/whitelist
export const addEntry = withPmgAxios(async (req, res, pmgAxios) => {
  const { value, type, otype } = req.body;
  if (!value || !type || !otype)
    return res.status(400).json({ error: 'Missing required fields' });

  const map = {
    email: 'email',
    domain: 'domain',
    ip: 'ip',
    network: 'network',
    regex: 'regex',
    ldapgroup: 'ldapgroup',
    ldapuser: 'ldapuser'
  };

  const path = map[otype.toLowerCase()];
  if (!['blacklist', 'whitelist'].includes(type.toLowerCase()) || !path)
    return res.status(400).json({ error: 'Invalid type or otype' });

  const groups = (await pmgAxios.get('/config/ruledb/who')).data.data;
  const group = groups.find(g => g.name.toLowerCase() === type.toLowerCase());

  if (!group)
    return res.status(404).json({ error: 'Group not found' });

  const payload = { [path]: value };
  const response = await pmgAxios.post(`/config/ruledb/who/${group.id}/${path}`, payload);

  res.status(201).json({ message: 'Entry added', result: response.data });
});

// Update entry
export const updateEntry = withPmgAxios(async (req, res, pmgAxios) => {
  const { ogroup, id } = req.params;
  const { value, otype } = req.body;

  const path = {
    email: 'email',
    domain: 'domain',
    ip: 'ip',
    network: 'network',
    regex: 'regex',
    ldapgroup: 'ldapgroup',
    ldapuser: 'ldapuser',
  }[otype?.toLowerCase()];

  if (!path || !value)
    return res.status(400).json({ error: 'Invalid request body' });

  const url = `/config/ruledb/who/${ogroup}/${path}/${id}`;
  const payload = { [path]: value };
  const response = await pmgAxios.put(url, payload);

  res.status(200).json({ message: 'Updated successfully', result: response.data });
});
