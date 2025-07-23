import { getPmgAxios } from '../pmg/pmgClient.js';

// Generic error handler
const handleError = (res, message, error) => {
  console.error(`${message}:`, error.response?.data || error.message);
  res.status(error.response?.status || 500).json({
    error: message,
    details: error.response?.data || error.message,
  });
};

// Wrapper to inject pmgAxios into all handlers
const withPmgAxios = (handler) => async (req, res) => {
  try {
    const pmgAxios = await getPmgAxios();
    await handler(req, res, pmgAxios);
  } catch (err) {
    handleError(res, 'PMG request failed', err);
  }
};

// Tracker
export const getTracker = withPmgAxios(async (req, res, pmgAxios) => {
  const node = req.query.node || 'pmg';
  const { data } = await pmgAxios.get(`/nodes/${node}/tracker`);
  res.status(200).json(data);
});

// Mail Count
export const getMailCount = withPmgAxios(async (req, res, pmgAxios) => {
  const { data } = await pmgAxios.get('/statistics/mailcount');
  res.status(200).json(data);
});

// Quarantine by type (spam, virus, etc.)
export const getQuarantineByType = (type) =>
  withPmgAxios(async (req, res, pmgAxios) => {
    const { data } = await pmgAxios.get(`/quarantine/${type}`);
    res.status(200).json(data);
  });

// Merge all quarantine types
export const getAllQuarantine = withPmgAxios(async (req, res, pmgAxios) => {
  const types = ['spam', 'virus', 'blacklist', 'attachment'];

  const allData = await Promise.all(
    types.map(async (type) => {
      try {
        const { data } = await pmgAxios.get(`/quarantine/${type}`);
        return data.data.map((item) => ({ ...item, reason: type }));
      } catch (error) {
        console.warn(`Skipping /quarantine/${type}:`, error.message);
        return [];
      }
    })
  );

  res.status(200).json({ success: true, data: allData.flat() });
});

// Quarantine action (deliver/delete/etc.)
export const quarantineAction = withPmgAxios(async (req, res, pmgAxios) => {
  const { action, id } = req.body;
  if (!action || !id) {
    return res.status(400).json({ error: 'Missing action or id' });
  }

  const response = await pmgAxios.post('/quarantine/content', { action, id });
  res.status(200).json({ message: `Mail ${action} executed`, result: response.data });
});

// Deliver/Delete mail by ID
export const quarantineActionById = (action) =>
  withPmgAxios(async (req, res, pmgAxios) => {
    const { id } = req.params;
    await pmgAxios.post('/quarantine/content', { action, id });
    res.status(200).json({ message: `Mail ${action}ed successfully.` });
  });

// Stats by type (sender, receiver, spamscore)
export const getStatByType = (type) =>
  withPmgAxios(async (req, res, pmgAxios) => {
    const { data } = await pmgAxios.get(`/statistics/${type}`);
    res.status(200).json(data);
  });
