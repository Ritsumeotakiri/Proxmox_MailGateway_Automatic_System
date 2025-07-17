import React, { useState, useEffect, useRef } from 'react';
import { BsSearch } from 'react-icons/bs';
import Swal from 'sweetalert2';
import RuleCreator from '../../components/RuleCreator';
import { fetchRules, deleteRule, createRule, updateRule } from '../../api/ruleService';

function Policy() {
  const [showModal, setShowModal] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [selectedRule, setSelectedRule] = useState(null);
  const [policyData, setPolicyData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  const loadRules = async () => {
    try {
      const rules = await fetchRules();
      setPolicyData(rules);
    } catch (err) {
      console.error('❌ Failed to load rules:', err);
      Swal.fire('Error', 'Failed to fetch rules', 'error');
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortRules = (data) => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This rule will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteRule(id);
      setPolicyData((prev) => prev.filter((r) => r.id !== id));
      Swal.fire('Deleted!', 'Rule has been deleted.', 'success');
    } catch (err) {
      console.error('Delete failed:', err);
      Swal.fire('Failed', '❌ Failed to delete rule.', 'error');
    }
  };

  const handleEdit = (rule) => {
    setEditRule(rule);
    setShowModal(true);
  };

  const filteredRules = sortRules(policyData).filter(rule =>
    rule.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateConfirm = async (payload) => {
    try {
      if (editRule) {
        await updateRule(editRule.id, payload);
      } else {
        await createRule(payload);
      }

      await loadRules();
      setEditRule(null);
      setShowModal(false);
    } catch (err) {
      console.error('[Error Saving Rule]', err);
      Swal.fire('Error', '❌ Failed to save rule', 'error');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="quarantine-table">
        <div className="table-header">
          <h3>Rule and Policies</h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-bar" style={{ width: '250px' }}>
              <BsSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search here"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => { setEditRule(null); setShowModal(true); }}
              className="btn-primary"
            >
              Add Rule
            </button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th onClick={() => handleSort('name')}>Rule Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th>Condition</th>
              <th>Type</th>
              <th onClick={() => handleSort('priority')}>Priority {sortConfig.key === 'priority' && (sortConfig.direction === 'asc' ? '↑' : '↓')}</th>
              <th>Action</th>
              <th>⋮</th>
            </tr>
          </thead>
          <tbody>
            {filteredRules.map((rule, idx) => (
              <PolicyRow
                key={idx}
                rule={rule}
                onSelect={setSelectedRule}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </tbody>
        </table>
      </div>

      <RuleCreator
        visible={showModal}
        onClose={() => { setShowModal(false); setEditRule(null); }}
        onConfirm={handleCreateConfirm}
        initialData={editRule}
      />

      {selectedRule && (
        <div className="modal-overlay" onClick={() => setSelectedRule(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Rule Details</h3>
            {[
              ['ID', selectedRule.id],
              ['Name', selectedRule.name],
              ['Priority', selectedRule.priority],
              ['Status', selectedRule.active ? 'Active' : 'Inactive'],
              ['Direction', selectedRule.direction],
              ['What Group', selectedRule.what?.map(w => w.name).join(', ') || '—'],
              ['From Group', selectedRule.from?.map(f => f.name).join(', ') || '—'],
              ['To Group', selectedRule.to?.map(t => t.name).join(', ') || '—'],
              ['When', selectedRule.when?.map(w => w.name).join(', ') || '—'],
              ['Action(s)', selectedRule.action?.map(a => a.name).join(', ') || '—'],
            ].map(([label, value]) => (
              <div key={label} className="field"><strong>{label}:</strong> <span>{value}</span></div>
            ))}
            <button className="close-btn" onClick={() => setSelectedRule(null)}>Close</button>
          </div>
        </div>
      )}
    </main>
  );
}

function PolicyRow({ rule, onSelect, onDelete, onEdit }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const action = rule.action?.map(a => a.name).join(', ') || '—';
  const conditionLabel = rule.what?.length ? 'What' : rule.from?.length ? 'Sender' : 'Custom';
  const conditionText = rule.what?.map(w => w.name).join(', ') || rule.from?.map(f => f.name).join(', ') || '—';

  const colorMap = {
    'Block': 'badge-red',
    'Quarantine': 'badge-yellow',
    'Accept': 'badge-green',
  };
  const badgeColor = colorMap[action] || 'badge-orange';

  return (
    <tr>
      <td onClick={() => onSelect(rule)}>{rule.id}</td>
      <td onClick={() => onSelect(rule)}>{rule.name}</td>
      <td onClick={() => onSelect(rule)}>{conditionLabel}</td>
      <td onClick={() => onSelect(rule)}>
        <span className={`badge ${badgeColor}`} style={{ padding: '4px 10px', fontSize: '12px' }}>
          {conditionText}
        </span>
      </td>
      <td onClick={() => onSelect(rule)}>{rule.priority}</td>
      <td onClick={() => onSelect(rule)}>{action}</td>

      <td style={{ position: 'relative' }} ref={menuRef}>
        <div
          onClick={handleMenuClick}
          style={{ cursor: 'pointer', userSelect: 'none' }}
        >
          ⋮
        </div>

        {menuOpen && (
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
              minWidth: '120px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <button onClick={() => { setMenuOpen(false); onEdit(rule); }}>Edit</button>
            <button onClick={() => { setMenuOpen(false); onDelete(rule.id); }} className="delete-btn">Delete</button>
          </div>
        )}
      </td>
    </tr>
  );
}


export default Policy;
