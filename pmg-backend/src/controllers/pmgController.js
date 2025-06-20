import { getPmgAxios } from '../pmg/pmgClient.js';

// Generic error handler
const handleError = (res, message, error) => {
  console.error(`${message}:`, error.response?.data || error.message);
  res.status(error.response?.status || 500).json({
    error: message,
    details: error.response?.data || error.message,
  });
};

// Tracker
export const getTracker = async (req, res) => {
  const node = req.query.node || 'pmg';
  try {
    const pmgAxios = await getPmgAxios();
    const { data } = await pmgAxios.get(`/nodes/${node}/tracker`);
    res.status(200).json(data);
  } catch (err) {
    handleError(res, 'Failed to fetch tracker data from PMG', err);
  }
};

// Mail Count
export const getMailCount = async (req, res) => {
  try {
    const pmgAxios = await getPmgAxios();
    const { data } = await pmgAxios.get('/statistics/mailcount');
    res.status(200).json(data);
  } catch (err) {
    handleError(res, 'Failed to fetch mailcount statistics', err);
  }
};

// Quarantine types: spam, virus, etc.
export const getQuarantineByType = (type) => async (req, res) => {
  try {
    const pmgAxios = await getPmgAxios();
    const { data } = await pmgAxios.get(`/quarantine/${type}`);
    res.status(200).json(data);
  } catch (err) {
    handleError(res, `Failed to fetch ${type} quarantine`, err);
  }
};

// Merge quarantine
export const getAllQuarantine = async (req, res) => {
  try {
    const pmgAxios = await getPmgAxios();
    const types = ['spam', 'virus', 'blacklist', 'attachment'];

    const allData = await Promise.all(types.map(async (type) => {
      try {
        const { data } = await pmgAxios.get(`/quarantine/${type}`);
        return data.data.map(item => ({ ...item, reason: type }));
      } catch (error) {
        console.warn(`Skipping /quarantine/${type}:`, error.message);
        return [];
      }
    }));

    res.status(200).json({ success: true, data: allData.flat() });
  } catch (err) {
    handleError(res, 'Failed to fetch merged quarantine data', err);
  }
};

// Quarantine Action
export const quarantineAction = async (req, res) => {
  try {
    const { action, id } = req.body;
    if (!action || !id) {
      return res.status(400).json({ error: 'Missing action or id' });
    }

    const pmgAxios = await getPmgAxios();
    const response = await pmgAxios.post('/quarantine/content', { action, id });

    res.status(200).json({ message: `Mail ${action} executed`, result: response.data });
  } catch (err) {
    handleError(res, 'Quarantine action failed', err);
  }
};

// Deliver/Delete specific mail
export const quarantineActionById = (action) => async (req, res) => {
  try {
    const { id } = req.params;
    const pmgAxios = await getPmgAxios();
    await pmgAxios.post('/quarantine/content', { action, id });

    res.status(200).json({ message: `Mail ${action}ed successfully.` });
  } catch (err) {
    handleError(res, `Failed to ${action} mail`, err);
  }
};

// Stats: sender, receiver, spamscore
export const getStatByType = (type) => async (req, res) => {
  try {
    const pmgAxios = await getPmgAxios();
    const { data } = await pmgAxios.get(`/statistics/${type}`);
    res.status(200).json(data);
  } catch (err) {
    handleError(res, `Failed to fetch ${type} statistics`, err);
  }
};
