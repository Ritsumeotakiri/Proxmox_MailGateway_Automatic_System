import { getPmgAxios } from '../pmg/pmgClient.js';

export const listRuleGroups = async (req, res) => {
  try {
    const pmgAxios = await getPmgAxios();
    const response = await pmgAxios.get('/config/ruledb/who');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rule groups' });
  }
};

export const getGroupEntries = async (req, res) => {
  const { groupid } = req.params;
  try {
    const pmgAxios = await getPmgAxios();
    const response = await pmgAxios.get(`/config/ruledb/who/${groupid}/objects`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch group members' });
  }
};

export const deleteEntry = async (req, res) => {
  const { groupid, id } = req.params;
  try {
    const pmgAxios = await getPmgAxios();
    await pmgAxios.delete(`/config/ruledb/who/${groupid}/objects/${id}`);
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete entry' });
  }
};

export const getQuarantineBlacklist = async (req, res) => {
  const pmail = req.query.pmail;
  if (!pmail) return res.status(400).json({ error: 'Missing query param: pmail' });

  try {
    const pmgAxios = await getPmgAxios();
    const response = await pmgAxios.get('/quarantine/blacklist', { params: { pmail } });
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quarantine blacklist' });
  }
};

export const getQuarantineWhitelist = async (req, res) => {
  const pmail = req.query.pmail;
  if (!pmail) return res.status(400).json({ error: 'Missing query param: pmail' });

  try {
    const pmgAxios = await getPmgAxios();
    const response = await pmgAxios.get('/quarantine/whitelist', { params: { pmail } });
    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quarantine whitelist' });
  }
};

export const listBlackWhite = async (req, res) => {
  try {
    const pmgAxios = await getPmgAxios();
    const groupRes = await pmgAxios.get('/config/ruledb/who');
    const groups = groupRes.data.data;

    const blacklist = groups.find(g => g.name.toLowerCase() === 'blacklist');
    const whitelist = groups.find(g => g.name.toLowerCase() === 'whitelist');

    if (!blacklist || !whitelist) return res.status(404).json({ error: 'Missing group' });

    const [blacklistRes, whitelistRes] = await Promise.all([
      pmgAxios.get(`/config/ruledb/who/${blacklist.id}/objects`),
      pmgAxios.get(`/config/ruledb/who/${whitelist.id}/objects`)
    ]);

    res.status(200).json({
      blacklist: blacklistRes.data.data || [],
      whitelist: whitelistRes.data.data || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch black/white list' });
  }
};

export const addEntry = async (req, res) => {
  const { value, type, otype } = req.body;
  if (!value || !type || !otype) return res.status(400).json({ error: 'Missing required fields' });

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

  try {
    const pmgAxios = await getPmgAxios();
    const groups = (await pmgAxios.get('/config/ruledb/who')).data.data;
    const group = groups.find(g => g.name.toLowerCase() === type.toLowerCase());

    if (!group) return res.status(404).json({ error: 'Group not found' });

    const payload = { [path]: value };
    const response = await pmgAxios.post(`/config/ruledb/who/${group.id}/${path}`, payload);

    res.status(201).json({ message: 'Entry added', result: response.data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add entry' });
  }
};

export const updateEntry = async (req, res) => {
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

  if (!path || !value) return res.status(400).json({ error: 'Invalid request body' });

  try {
    const pmgAxios = await getPmgAxios();
    const url = `/config/ruledb/who/${ogroup}/${path}/${id}`;
    const payload = { [path]: value };
    const response = await pmgAxios.put(url, payload);

    res.status(200).json({ message: 'Updated successfully', result: response.data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update entry' });
  }
};
