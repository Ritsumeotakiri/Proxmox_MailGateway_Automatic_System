import { getPmgAxios } from '../pmg/pmgClient.js';

// GET all rules
export const getAllRules = async (req, res) => {
  try {
    const pmg = await getPmgAxios();
    const { data } = await pmg.get('/config/ruledb/rules');
    res.json(data);
  } catch (err) {
    console.error('[GET RULES ERROR]', err?.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to fetch rules',
      details: err?.response?.data || err.message,
    });
  }
};
// CREATE a new rule and inject groups
export const createRule = async (req, res) => {
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
    const pmg = await getPmgAxios();

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

    // Step 2: Attach groups if provided
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
    if (Number.isInteger(actionGroupOgroup)) await attachGroup('action', actionGroupOgroup);

    res.status(201).json({
      message: 'Rule created successfully and groups injected',
      ruleId,
    });
  } catch (err) {
    console.error('[CREATE RULE ERROR]', err?.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to create rule',
      details: err?.response?.data || err.message,
    });
  }
};

// DELETE rule by ID
export const deleteRule = async (req, res) => {
  const { id } = req.params;

  try {
    const pmg = await getPmgAxios();
    await pmg.delete(`/config/ruledb/rules/${id}`);
    res.json({ message: 'Rule deleted successfully' });
  } catch (err) {
    console.error('[DELETE RULE ERROR]', err?.response?.data || err.message);
    res.status(500).json({
      error: 'Failed to delete rule',
      details: err?.response?.data || err.message,
    });
  }
};
