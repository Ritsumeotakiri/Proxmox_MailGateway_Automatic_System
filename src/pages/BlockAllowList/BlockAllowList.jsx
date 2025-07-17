import React, { useState, useEffect, useRef } from 'react';
import { BsSearch } from 'react-icons/bs';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FiMoreVertical } from 'react-icons/fi';
import AddRuleModal from '../../components/Black_WhiteModel';
import '../../styles/BlockAllowList.css';

function BlockAllowList() {
  const [policyData, setPolicyData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editData, setEditData] = useState(null);
  const [menuIndex, setMenuIndex] = useState(null);
  const menuRef = useRef(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBlockAllowList();
  }, []);

  const fetchBlockAllowList = async () => {
    try {
      const res = await axios.get('/api/pmg/block-allow/list', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const merged = [
        ...res.data.blacklist.map(e => ({ ...e, type: 'Blacklist' })),
        ...res.data.whitelist.map(e => ({ ...e, type: 'Whitelist' })),
      ];
      setPolicyData(merged);
    } catch (err) {
      Swal.fire('❌ Error', 'Failed to fetch block/allow data', 'error');
    }
  };

  const otypeMap = {
    'Mail address': 'email',
    'Domain': 'domain',
    'IP Address': 'ip',
    'IP Network': 'network',
    'LDAP Group': 'ldapgroup',
    'LDAP User': 'ldapuser',
    'Regular Expression': 'regex',
  };

  const handleAddRule = async (rule, isEdit = false, original = null) => {
    try {
      if (isEdit && original) {
        const ogroup = original.ogroup;
        const mappedOtype = otypeMap[original.otype_text];
        if (!mappedOtype) throw new Error('Invalid otype for edit');

        await axios.put(`/api/pmg/block-allow/${ogroup}/${original.id}`, {
          value: rule.value,
          otype: mappedOtype,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        Swal.fire('✅ Updated', 'Entry updated successfully.', 'success');
      } else {
        await axios.post('/api/pmg/block-allow', rule, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire('✅ Success', 'Rule added successfully.', 'success');
      }

      setShowModal(false);
      setEditData(null);
      fetchBlockAllowList();
    } catch (err) {
      Swal.fire('❌ Failed', err.response?.data?.error || err.message, 'error');
    }
  };

  const handleDelete = async (type, id) => {
    const result = await Swal.fire({
      title: 'Delete Entry?',
      text: 'Are you sure you want to delete this rule?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
    });

    if (!result.isConfirmed) return;

    const ogroup = type.toLowerCase() === 'blacklist' ? 2 : 3;

    try {
      await axios.delete(`/api/pmg/block-allow/${ogroup}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBlockAllowList();
      Swal.fire('Deleted!', 'Entry has been deleted.', 'success');
    } catch (err) {
      Swal.fire('Failed', err.response?.data?.error || err.message, 'error');
    }
  };

  const handleEdit = (entry) => {
    setEditData(entry);
    setShowModal(true);
    setMenuIndex(null);
  };

  useEffect(() => {
    const closeDropdown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuIndex(null);
      }
    };
    document.addEventListener('mousedown', closeDropdown);
    return () => document.removeEventListener('mousedown', closeDropdown);
  }, []);

  const filteredData = policyData.filter(entry => {
    const keyword = searchTerm.toLowerCase();
    return Object.values(entry).some(val =>
      typeof val === 'string' && val.toLowerCase().includes(keyword)
    );
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="blockallow-table-container">
        <div className="blockallow-table-header">
          <h3>Block/Allow List</h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="search-bar">
              <BsSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search here"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                setEditData(null);
                setShowModal(true);
              }}
            >
              Add Rule
            </button>
          </div>
        </div>

        <table className="blockallow-table">
          <thead>
            <tr>
              <th>Email / Domain / IP</th>
              <th>Type</th>
              <th>OType</th>
              <th>Status</th>
              <th>⋮</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => (
              <tr key={idx}>
                <td>{item.email || item.domain || item.ip || item.regex || item.ldapgroup || item.ldapuser || item.descr || '—'}</td>
                <td><span className={`badge ${item.type === 'Blacklist' ? 'badge-blacklist' : 'badge-whitelist'}`}>{item.type}</span></td>
                <td>{item.otype_text || '—'}</td>
                <td>Active</td>
                <td style={{ position: 'relative' }} ref={menuIndex === idx ? menuRef : null}>
                  <FiMoreVertical
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuIndex(prev => (prev === idx ? null : idx));
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  {menuIndex === idx && (
                    <div
                      className="dropdown-menu"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        background: '#fff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        padding: '8px',
                        borderRadius: '4px',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        minWidth: '120px',
                      }}
                    >
                      <button onClick={() => handleEdit(item)}>Edit</button>
                      <button onClick={() => handleDelete(item.type, item.id)} className="delete-btn">Delete</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AddRuleModal
          onClose={() => {
            setShowModal(false);
            setEditData(null);
          }}
          onSubmit={(data) => handleAddRule(data, !!editData, editData)}
          initialValue={editData}
        />
      )}
    </main>
  );
}

export default BlockAllowList;
