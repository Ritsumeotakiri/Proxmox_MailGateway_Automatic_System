import axios from 'axios';
import https from 'https';

export async function loginToPMG() {
  const pmgBaseUrl = process.env.PMG_API_URL; 

  try {
    const response = await axios.post(
      `${pmgBaseUrl}/api2/json/access/ticket`,
      new URLSearchParams({
        username: process.env.PMG_USERNAME,
        password: process.env.PMG_PASSWORD,
      }),
      {
        httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      }
    );
    return response.data.data;
  } catch (error) {
    console.error('PMG login failed:', error.response?.data || error.message || error);
    throw error;
  }
}
