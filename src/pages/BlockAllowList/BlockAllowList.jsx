import React, { useState, useEffect, useRef } from 'react';
import { BsSearch } from 'react-icons/bs';
import { FiMoreVertical } from 'react-icons/fi';
import AddRuleModal from '../../components/Black_WhiteModel';
import axios from 'axios';
import Swal from 'sweetalert2';
import '../../styles/BlockAllowList.css';

function BlockAllowList() {
  const [policyData, setPolicyData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownIndex, setDropdownIndex] = useState(null);
  const [editData, setEditData] = useState(null);
  const dropdownRefs = useRef([]);

  useEffect(() => {
    fetchBlockAllowList();
  }, []);

  const setDropdownRef = (index, el) => {
    dropdownRefs.current[index] = el;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutside = !dropdownRefs.current.some(
        ref => ref && ref.contains(event.target)
      );
      if (clickedOutside) setDropdownIndex(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBlockAllowList = async () => {
    try {
      const res = await axios.get('/api/pmg/block-allow/list');
      const merged = [
        ...res.data.blacklist.map(e => ({ ...e, type: 'Blacklist' })),
        ...res.data.whitelist.map(e => ({ ...e, type: 'Whitelist' }))
      ];
      setPolicyData(merged);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  const otypeMap = {
    'Mail address': 'email',
    'Domain': 'domain',
    'IP Address': 'ip',
    'IP Network': 'network',
    'LDAP Group': 'ldapgroup',
    'LDAP User': 'ldapuser',
    'Regular Expression': 'regex'
  };

  const handleAddRule = async (rule, isEdit = false, original = null) => {
  try {
    if (isEdit && original) {
      const ogroup = original.ogroup; // 👈 use real group ID from data
      const mappedOtype = otypeMap[original.otype_text];
      if (!mappedOtype) throw new Error('Invalid otype for edit');

      await axios.put(`/api/pmg/block-allow/${ogroup}/${original.id}`, {
        value: rule.value,
        otype: mappedOtype
      });

      Swal.fire('✅ Updated', 'Entry updated successfully.', 'success');
    } else {
      await axios.post('/api/pmg/block-allow', rule);
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
      await axios.delete(`/api/pmg/block-allow/${ogroup}/${id}`);
      fetchBlockAllowList();
      Swal.fire('Deleted!', 'Entry has been deleted.', 'success');
    } catch (err) {
      Swal.fire('Failed', err.response?.data?.error || err.message, 'error');
    }
  };

  const handleEdit = (entry) => {
    setEditData(entry);
    setShowModal(true);
    setDropdownIndex(null);
  };

  const filteredData = policyData.filter(entry => {
    const keyword = searchTerm.toLowerCase();
    return (
      (entry.email && entry.email.toLowerCase().includes(keyword)) ||
      (entry.domain && entry.domain.toLowerCase().includes(keyword)) ||
      (entry.ip && entry.ip.toLowerCase().includes(keyword)) ||
      (entry.regex && entry.regex.toLowerCase().includes(keyword)) ||
      (entry.ldapgroup && entry.ldapgroup.toLowerCase().includes(keyword)) ||
      (entry.ldapuser && entry.ldapuser.toLowerCase().includes(keyword)) ||
      (entry.descr && entry.descr.toLowerCase().includes(keyword))
    );
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8" style={{ width: '100%' }}>
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
              style={{
                padding: '6px 16px',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
                boxShadow: '0 2px 6px rgb(37 99 235 / 0.5)',
                whiteSpace: 'nowrap',
              }}
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
              <th style={{ width: 30, textAlign: 'center' }}>⋮</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, idx) => (
              <BlockAllowRow
                key={idx}
                rowIndex={idx}
                {...item}
                onDelete={() => handleDelete(item.type, item.id)}
                onEdit={() => handleEdit(item)}
                isDropdownOpen={dropdownIndex === idx}
                toggleDropdown={() => setDropdownIndex(dropdownIndex === idx ? null : idx)}
                onOutsideClickRef={setDropdownRef}
              />
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

function BlockAllowRow({
  id, email, domain, ip, network, regex, ldapgroup, ldapuser, descr,
  type, otype_text, onDelete, onEdit, isDropdownOpen, toggleDropdown, rowIndex, onOutsideClickRef
}) {
  const badgeColors = {
    Blacklist: 'badge-blacklist',
    Whitelist: 'badge-whitelist',
  };
  const badgeClass = badgeColors[type] || 'badge-default';
  const value = email || domain || ip || network || regex || ldapgroup || ldapuser || descr || '—';

  return (
    <tr>
      <td>{value}</td>
      <td><span className={`badge ${badgeClass}`}>{type}</span></td>
      <td>{otype_text || '—'}</td>
      <td>Active</td>
      <td
        style={{ position: 'relative', textAlign: 'center' }}
        ref={el => onOutsideClickRef(rowIndex, el)}
      >
        <FiMoreVertical style={{ cursor: 'pointer' }} onClick={toggleDropdown} />
        {isDropdownOpen && (
          <div className="dropdown-menu" onMouseDown={(e) => e.stopPropagation()}>
            <button onClick={onEdit}>Edit</button>
            <button onClick={onDelete}>Delete</button>
          </div>
        )}
      </td>
    </tr>
  );
}

export default BlockAllowList;
