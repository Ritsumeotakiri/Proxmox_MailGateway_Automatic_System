import dotenv from 'dotenv';
dotenv.config();

import { loginToPMG } from '../pmg/pmgAuthService.js';

(async () => {
  console.log('PMG_API_URL:', process.env.PMG_API_URL); 

  try {
    const authData = await loginToPMG();
    console.log('PMG login success:', authData);
  } catch (e) {
    console.error('Login error:', e);
  }
})();
