import dotenv from 'dotenv';
dotenv.config();

import { getPmgAxios } from '../pmg/pmgClient.js';

function reorderKeys(data, keysOrder) {
  if (Array.isArray(data)) {
    return data.map(item => {
      const ordered = {};
      keysOrder.forEach(k => {
        if (k in item) ordered[k] = item[k];
      });
      return ordered;
    });
  }
  return data;
}

(async () => {
  try {
    const pmgAxios = await getPmgAxios();

    console.log('Fetching receiver statistics from PMG...');
    const response = await pmgAxios.get('/nodes/pmg/tracker');

    // Define the order you want
    const keysOrder = ['id', 'qid', 'from', 'to', 'relay', 'size', 'time', 'dstatus'];

    const normalizedData = reorderKeys(response.data.data, keysOrder);

    console.log('Receiver Statistics:', JSON.stringify(normalizedData, null, 2));
  } catch (error) {
    console.error('❌ Error fetching receiver statistics:', error.response?.data || error.message);
    process.exit(1);
  }
})();

