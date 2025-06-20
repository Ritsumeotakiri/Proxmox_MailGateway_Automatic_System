import React, { useState, useEffect } from 'react';
import '../styles/BlockAllowList.css';

const TYPES = [
  { label: 'E-Mail', value: 'email' },
  { label: 'Domain', value: 'domain' },
  { label: 'IP Address', value: 'ip' },
  { label: 'IP Network', value: 'network' },
  { label: 'LDAP Group', value: 'ldapgroup' },
  { label: 'LDAP User', value: 'ldapuser' },
  { label: 'Regular Expression', value: 'regex' }
];

// 🧪 Validators
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidIP = (ip) =>
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/.test(ip);

function AddRuleModal({ onClose, onSubmit, initialValue }) {
  const [entryType, setEntryType] = useState('email');
  const [value, setValue] = useState('');
  const [listType, setListType] = useState('blacklist');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValue) {
      setEntryType(initialValue.otype_text?.toLowerCase() || 'email');
      setValue(
        initialValue.email ||
        initialValue.domain ||
        initialValue.ip ||
        initialValue.network ||
        initialValue.regex ||
        initialValue.ldapgroup ||
        initialValue.ldapuser ||
        initialValue.descr || ''
      );
      setListType(initialValue.type?.toLowerCase() || 'blacklist');
    }
  }, [initialValue]);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) return alert('⚠ Value is required');

    // Format checks
    if (entryType === 'email' && !isValidEmail(trimmed)) {
      return alert('❌ Invalid email format');
    }
    if (entryType === 'ip' && !isValidIP(trimmed)) {
      return alert('❌ Invalid IP address format');
    }

    setLoading(true);
    try {
      await onSubmit({ value: trimmed, otype: entryType, type: listType });
      onClose();
    } catch (err) {
      alert('❌ Failed to submit rule');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const isEdit = !!initialValue;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>{isEdit ? 'Edit Rule' : 'Add Rule'}</h3>

        <div className="form-group">
          <label>Entry Type</label>
          <select
            value={entryType}
            onChange={(e) => setEntryType(e.target.value)}
            disabled={isEdit}
          >
            {TYPES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Value</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="example@domain.com or 192.168.0.1"
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="form-group">
          <label>List Type</label>
          <select
            value={listType}
            onChange={(e) => setListType(e.target.value)}
            disabled={isEdit}
          >
            <option value="blacklist">Blacklist</option>
            <option value="whitelist">Whitelist</option>
          </select>
        </div>

        <div className="modal-actions">
          <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update' : 'Add'}
          </button>
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddRuleModal;
