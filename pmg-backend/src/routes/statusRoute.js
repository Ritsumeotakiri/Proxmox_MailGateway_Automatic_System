import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: 'PMG backend running' });
  console.log('PMG running');
});

export default router;
