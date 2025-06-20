import React, { useEffect, useState } from 'react';
import { BsSearch } from 'react-icons/bs';
import Swal from 'sweetalert2';

import '../../styles/card.css';
import '../../styles/table.css';
import '../../styles/header.css';
import '../../styles/App.css';
import '../../styles/popup.css';

import TableRow from '../Qurantine/components/TableRow';
import { formatReadableTime, formatSize } from '../../utils/formatters';
import { fetchQuarantineData } from '../../api/pmgService';

function Quarantine() {
  const [quarantineData, setQuarantineData] = useState([]);
  const [search, setSearch] = useState('');
  const [reasonFilter, setReasonFilter] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchQuarantineData();
      const formatted = data.map(item => ({
        ...item,
        time: formatReadableTime(item.time),
        size: formatSize(item.size),
      }));
      setQuarantineData(formatted);
    } catch (err) {
      Swal.fire('Error', 'Could not load quarantine data', 'error');
    }
  };

  // ⬇️ Remove item from local list after delete
  const handleRemoveFromList = (id) => {
    setQuarantineData(prev => prev.filter(item => item.id !== id));
  };

  const filtered = quarantineData.filter(({ sender, receiver, reason }) => {
    const matchesSearch = [sender, receiver, reason].some(field =>
      field?.toLowerCase().includes(search.toLowerCase())
    );
    const matchesFilter =
      reasonFilter === 'All' || reason === reasonFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="quarantine-table">
        <div className="table-header">
          <h3>Quarantine Management</h3>
          <div className="search-bar">
            <BsSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search here"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label>Filter by Reason:</label>
          <select value={reasonFilter} onChange={e => setReasonFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Spam">Spam</option>
            <option value="Virus">Virus</option>
            <option value="Blacklist">Blacklist</option>
            <option value="Attachment">Attachment</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Quarantine Reason</th>
              <th>Time</th>
              <th>Message Size</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <TableRow key={item.id} {...item} onDelete={handleRemoveFromList} />
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Quarantine;
