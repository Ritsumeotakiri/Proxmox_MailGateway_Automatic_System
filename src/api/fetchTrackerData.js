import { normalizeTrackerData } from '../utils/normalizeTracker';
import { processChartData } from '../utils/ChartUtils';

/**
 * Count all emails with dstatus === 'Q' (Quarantined)
 */
export function countQuarantinedEmails(data) {
  return data.reduce((total, log) => total + (log.dstatus === 'Q' ? 1 : 0), 0);
}

/**
 * Fetch Tracker Data
 */
export async function fetchAndPrepareTrackerData(setData, setChart, setQuarantineCount) {
  try {
    const res = await fetch('/api/pmg/tracker', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await res.json();
    const normalized = normalizeTrackerData(data);

    setData(normalized);
    setChart(processChartData(normalized));
    setQuarantineCount(countQuarantinedEmails(normalized));
  } catch (err) {
    console.error('Failed to fetch tracker data:', err);
  }
}

export async function ChartCount (setData, setChart, setQuarantineCount) {
  try {
    const res = await fetch('/api/stats/chart-data', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const logs = await res.json();

    setData(logs); // raw data for table
    setChart(processChartData(logs)); // processed for chart
    setQuarantineCount(logs.filter(log => log.dstatus === 'Q').length); // count quarantined
  } catch (err) {
    console.error('Failed to fetch tracker data from MongoDB archive:', err);
  }
}



/**
 * Fetch Spam Score Data
 */
export async function fetchSpamScoreData(setSpamDetected, setChartData) {
  try {
    const res = await fetch('/api/pmg/quarantine/spam', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const data = await res.json();

    const monthlySpam = {};

    data.data.forEach(item => {
      const level = Number(item.spamlevel || 0);
      if (level < 5) return;

      const date = new Date(item.time * 1000);
      const month = date.toLocaleString('en-US', { month: 'short' });
      monthlySpam[month] = (monthlySpam[month] || 0) + 1;
    });

    const totalSpam = Object.values(monthlySpam).reduce((sum, count) => sum + count, 0);
    setSpamDetected(totalSpam);

    setChartData(prev =>
      prev.map(entry => ({
        ...entry,
        spam: monthlySpam[entry.name] || 0
      }))
    );
  } catch (err) {
    console.error('Failed to fetch spam score data:', err);
    setSpamDetected(0);
  }
}
