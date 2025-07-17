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
 * Fetch Spam Score Data - Merge spam count into existing chart data
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
      (prev || []).map(entry => ({
        ...entry,
        spam: monthlySpam[entry.name] || 0
      }))
    );
  } catch (err) {
    console.error('Failed to fetch spam score data:', err);
    setSpamDetected(0);
  }
}

export async function fetchMailLogChart(setChartData) {
  try {
    const res = await fetch('/api/stats/logs', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    const logs = await res.json();
    const currentYear = new Date().getFullYear();

    // Step 1: Prepare 12 months with default values
    const months = Array.from({ length: 12 }, (_, i) => {
      const label = new Date(currentYear, i).toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      return {
        name: label,
        sent: 0,
        spam: 0,
        virus: 0,
        quarantine: 0,
      };
    });

    // Step 2: Loop through logs and update the right month
    logs.forEach(log => {
      const date = new Date(log.date);
      const label = date.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      });

      const monthEntry = months.find(m => m.name === label);
      if (!monthEntry) return;

      // Every mail log is one "sent"
      monthEntry.sent += 1;

      // If it's spam
      if (log.isSpam) {
        monthEntry.spam += 1;
        monthEntry.quarantine += 1;
      }

      // If it's virus
      if (log.isVirus) {
        monthEntry.virus += 1;
        monthEntry.quarantine += 1;
      }
    });

    setChartData(months);
  } catch (err) {
    console.error('❌ Failed to fetch chart logs:', err);
  }
}
