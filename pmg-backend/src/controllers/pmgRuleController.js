import { getPmgAxios } from '../pmg/pmgClient.js';

const handleError = (res, message, err) => {
  console.error(`[${message.toUpperCase()}]`, err?.response?.data || err.message);
  res.status(err?.response?.status || 500).json({
    error: message,
    details: err?.response?.data || err.message,
  });
};

// Wrapper to inject pmgAxios instance per request
const withPmgAxios = (handler) => async (req, res) => {
  try {
    const pmg = await getPmgAxios();
    await handler(req, res, pmg);
  } catch (err) {
    handleError(res, 'PMG connection failed', err);
  }
};

// GET all rules
export const getAllRules = withPmgAxios(async (req, res, pmg) => {
  const { data } = await pmg.get('/config/ruledb/rules');
  res.json(data);
});

// CREATE a new rule and inject groups
export const createRule = withPmgAxios(async (req, res, pmg) => {
  const {
    ruleName,
    priority = 90,
    direction = 0,
    active = 1,
    whatGroupId,
    fromGroupId,
    toGroupId,
    whenGroupId,
    actionGroupOgroup,
  } = req.body;

  if (!ruleName) {
    return res.status(400).json({ error: 'Missing ruleName in request body' });
  }

  try {
    // Step 1: Create the base rule
    const ruleRes = await pmg.post('/config/ruledb/rules', {
      name: ruleName,
      priority,
      direction,
      active,
    });

    const ruleId = ruleRes?.data?.data;
    if (!ruleId) {
      return res.status(500).json({ error: 'Rule created but no rule ID returned by PMG' });
    }

    // Step 2: Attach groups
    const attachGroup = async (type, groupId) => {
      try {
        await pmg.post(`/config/ruledb/rules/${ruleId}/${type}`, { ogroup: groupId });
      } catch (err) {
        console.warn(`[Attach ${type.toUpperCase()} FAILED]`, err?.response?.data || err.message);
      }
    };

    if (Number.isInteger(whatGroupId)) await attachGroup('what', whatGroupId);
    if (Number.isInteger(fromGroupId)) await attachGroup('from', fromGroupId);
    if (Number.isInteger(toGroupId)) await attachGroup('to', toGroupId);
    if (Number.isInteger(whenGroupId)) await attachGroup('when', whenGroupId);

    if (Array.isArray(actionGroupOgroup)) {
      for (const groupId of actionGroupOgroup) {
        if (Number.isInteger(groupId)) {
          await attachGroup('action', groupId);
        }
      }
    } else if (Number.isInteger(actionGroupOgroup)) {
      await attachGroup('action', actionGroupOgroup);
    }

    res.status(201).json({
      message: 'Rule created successfully and groups injected',
      ruleId,
    });
  } catch (err) {
    handleError(res, 'Failed to create rule', err);
  }
});

// DELETE rule by ID
export const deleteRule = withPmgAxios(async (req, res, pmg) => {
  const { id } = req.params;
  await pmg.delete(`/config/ruledb/rules/${id}`);
  res.json({ message: 'Rule deleted successfully' });
});
