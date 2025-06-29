import axios from 'axios';

// Fetch the current quarantine settings
export async function getQuarantineSettings() {
  try {
    const res = await axios.get('/api/settings/quarantine-settings');
    return res.data; // Return the settings data
  } catch (error) {
    console.error('❌ Failed to fetch quarantine settings:', error.message || error);
    throw error; // Optionally throw the error for further handling
  }
}

// Save the quarantine settings
export async function saveQuarantineSettings(settings) {
  try {
    const res = await axios.put('/api/settings/quarantine-settings', settings);
    return res.data; // Return the updated settings data or success response
  } catch (error) {
    console.error('❌ Failed to save quarantine settings:', error.message || error);
    throw error; // Optionally throw the error for further handling
  }
}
