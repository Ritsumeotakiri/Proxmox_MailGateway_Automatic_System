import express from 'express';
import { getPmgAxios } from '../pmg/pmgClient.js';

const router = express.Router();

router.get('/test', async (req, res) => {
  try {
    const pmgAxios = await getPmgAxios();
    const response = await pmgAxios.get('/statistics/sender');
    res.json(response.data);
  } catch (error) {
    console.error('PMG API test failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
