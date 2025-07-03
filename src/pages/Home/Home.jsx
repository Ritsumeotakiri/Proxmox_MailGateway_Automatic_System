import React, { useEffect, useState, useRef } from 'react';
import { BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill } from 'react-icons/bs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

import '../../styles/card.css';
import '../../styles/table.css';
import '../../styles/header.css';
import '../../styles/App.css';

import {
  fetchAndPrepareTrackerData,
  fetchSpamScoreData,
  ChartCount,
} from '../../api/fetchTrackerData';
import { formatTime, mapStatus } from '../../utils/formatUtils';
import { Card } from './components/Card';
import { TableRow } from './components/TableRow';

const socket = io('http://localhost:3000');

function Home() {
  const navigate = useNavigate();
  const quarantinePath = () => navigate('/Quarantine');

  const [trackerData, setTrackerData] = useState([]);
  const [mailChartData, setMailChartData] = useState([]);
  const [spamDetected, setSpamDetected] = useState(0);
  const [qurantineCount, setQurantineCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const trackingRef = useRef(null);
  const shownAlerts = useRef(new Set());

  const scrollToTracking = () => {
    trackingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchAll = () => {
    fetchAndPrepareTrackerData(setTrackerData, () => {}, setQurantineCount);
    ChartCount(() => {}, setMailChartData, () => {});
    fetchSpamScoreData(setSpamDetected, setMailChartData);
  };

  useEffect(() => {
    fetchAll();

    console.log('Setting up socket listeners');

    socket.on('mailLog', (data) => {
      console.log('mailLog event received:', data.message);
      fetchAll();
    });

    socket.on('mailAlert', (data) => {
      const alertKey = `${data.message}-${new Date(data.time).getTime()}`;
      if (!shownAlerts.current.has(alertKey)) {
        shownAlerts.current.add(alertKey);

        // Optional cleanup to limit memory usage
        if (shownAlerts.current.size > 50) {
          const first = shownAlerts.current.values().next().value;
          shownAlerts.current.delete(first);
        }

        console.log('mailAlert event received:', data.message);
        fetchAll();

        // Optional: trigger a toast here
        // toast.info(data.message);
      } else {
        console.log('Duplicate alert skipped:', data.message);
      }
    });

    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('mailLog');
      socket.off('mailAlert');
    };
  }, []);

  const filteredLogs = [...trackerData]
    .filter((log) => {
      const term = searchTerm.toLowerCase();
      return (
        (log.from || '').toLowerCase().includes(term) ||
        (log.to || '').toLowerCase().includes(term) ||
        formatTime(log.time).toLowerCase().includes(term)
      );
    })
    .reverse();

  return (
    <div className="home-container">
      <div className="main-title">
        <h3>DASHBOARD</h3>
      </div>

      <div className="main-cards">
        <Card
          color="blue"
          icon={<BsFillArchiveFill />}
          label="Emails Sent"
          value={trackerData.length}
          growth="⬆ Live"
          onClick={scrollToTracking}
        />
        <Card
          color="orange"
          icon={<BsFillGrid3X3GapFill />}
          label="Spam Detected"
          value={spamDetected}
          growth="⬆ Live"
          onClick={quarantinePath}
        />
        <Card
          color="purple"
          icon={<BsPeopleFill />}
          label="Email Quarantined"
          value={qurantineCount}
          growth="⬆ Live"
        />
      </div>

      <div className="email-threat-container">
        <div className="chart-panel">
          <div className="chart-header">
            <h3>Email Threat Trend</h3>
            <select className="dropdown-filter">
              <option>This year</option>
              <option>Last 6 months</option>
              <option>Last 30 days</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mailChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sent" stackId="a" fill="#38bdf8" name="Sent Emails" />
              <Bar dataKey="spam" stackId="a" fill="#f87171" name="Spam" />
              <Bar dataKey="virus" stackId="a" fill="#a78bfa" name="Virus" />
              <Bar dataKey="quarantine" stackId="a" fill="#fcd34d" name="Quarantine" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="quarantine-table" ref={trackingRef}>
        <div className="table-header">
          <h3>Tracking Center</h3>
          <span className="table-menu">⋮</span>
        </div>

        <div className="search-bar">
          <input
            type="text"
            className="search-input"
            placeholder="Search sender, receiver or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <table>
          <thead>
            <tr>
              <th>Email/Sender</th>
              <th>Receiver</th>
              <th>Status</th>
              <th>Time</th>
              <th>Message Size</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                  There is no data.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <TableRow
                  key={`${log.id}-${log.time}`}
                  sender={log.from}
                  reason={log.to}
                  action={mapStatus(log.dstatus, log.rstatus)}
                  time={formatTime(log.time)}
                  size={log.size || '-'}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Home;
