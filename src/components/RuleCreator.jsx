import React, { useState } from 'react';
import { toast } from 'react-toastify'; // Correct import for toast
import '../styles/policyModel.css';
import 'react-toastify/dist/ReactToastify.css';  // Make sure to import the CSS for toasts

// Preset static group mappings for rules
const PRESETS = {
  whatGroups: {
    'Dangerous Content': 55,
    'Images': 52,
    'Multimedia': 53,
    'Office Files': 54,
    'Spam (Level 3)': 57,
    'Spam (Level 5)': 58,
    'Spam (Level 10)': 59,
    'Virus': 56,
  },
  fromGroups: [
    { id: 49, name: 'Blacklist' },
    { id: 50, name: 'Whitelist' }
  ],
  toGroups: [
    { id: 49, name: 'Blacklist' },
    { id: 50, name: 'Whitelist' }
  ],
  whenGroups: [
    { id: 51, name: 'Office Hours' }
  ],
  actionGroups: {
    'Accept': 64,
    'Block': 65,
    'Quarantine': 66,
    'Notify Admin': 67,
    'Notify Sender': 68,
    'Disclaimer': 69,
    'Modify Spam Level': 60,
    'Modify Spam Subject': 61,
    'Remove Attachments': 62,
    'Remove all attachments': 63,
    'Attachment Quarantine (remove matching)': 70,
    'Attachment Quarantine (remove all)': 71
  }
};

export default function RuleCreator({ visible, onClose, onConfirm }) {
  const [form, setForm] = useState({
    ruleName: '',
    priority: 90,
    direction: 0,
    active: true,
    whatGroup: '',
    fromGroupId: '',
    whenGroupId: '',
    actionGroup: ''
  });

  const [status, setStatus] = useState(null); // success | error

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      ruleName: form.ruleName,
      priority: Number(form.priority),
      direction: Number(form.direction),
      active: form.active ? 1 : 0,
      whatGroupId: PRESETS.whatGroups[form.whatGroup] || undefined,
      fromGroupId: form.fromGroupId ? Number(form.fromGroupId) : undefined,
      whenGroupId: form.whenGroupId ? Number(form.whenGroupId) : undefined,
      actionGroupOgroup: PRESETS.actionGroups[form.actionGroup] || undefined,
    };

    if (!payload.ruleName || !payload.actionGroupOgroup) {
      setStatus('error');
      console.warn('❌ Missing required fields');
      return;
    }

    try {
      console.log('Creating rule...');
      await onConfirm(payload);
      setStatus('success');
      toast.success('✅ Rule created successfully!', { // Success toast
        position: "top-right",
        autoClose: 5000, // Close after 5 seconds
      });
      setTimeout(() => {
        setStatus(null);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('❌ Rule creation failed:', err);
      setStatus('error');
      toast.error('❌ Failed to create rule. Please try again later.', { // Error toast
        position: "top-right",
        autoClose: 5000, // Close after 5 seconds
      });
      setTimeout(() => setStatus(null), 3000);
    }
  };

  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Create PMG Rule</h2>

        {status && (
          <div className={`status-message ${status}`}>
            {status === 'success'
              ? '✅ Rule created successfully.'
              : '❌ Failed to create rule.'}
          </div>
        )}

        <input
          type="text"
          name="ruleName"
          placeholder="Rule Name"
          value={form.ruleName}
          onChange={handleChange}
        />

        <input
          type="number"
          name="priority"
          placeholder="Priority (default 90)"
          value={form.priority}
          onChange={handleChange}
        />

        <label>What Group</label>
        <select name="whatGroup" value={form.whatGroup} onChange={handleChange}>
          <option value="">-- None --</option>
          {Object.entries(PRESETS.whatGroups).map(([name, id]) => (
            <option key={id} value={name}>{name}</option>
          ))}
        </select>

        <label>From Group</label>
        <select name="fromGroupId" value={form.fromGroupId} onChange={handleChange}>
          <option value="">-- None --</option>
          {PRESETS.fromGroups.map((group) => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>

        <label>When Group</label>
        <select name="whenGroupId" value={form.whenGroupId} onChange={handleChange}>
          <option value="">-- None --</option>
          {PRESETS.whenGroups.map((group) => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>

        <label>Action</label>
        <select name="actionGroup" value={form.actionGroup} onChange={handleChange}>
          <option value="">-- Required --</option>
          {Object.entries(PRESETS.actionGroups).map(([name, id]) => (
            <option key={id} value={name}>{name}</option>
          ))}
        </select>

        <label>
          <input
            type="checkbox"
            name="active"
            checked={form.active}
            onChange={handleChange}
          />
          Active
        </label>

        <label>Direction</label>
        <select name="direction" value={form.direction} onChange={handleChange}>
          <option value="0">Inbound (0)</option>
          <option value="1">Outbound (1)</option>
          <option value="2">Both (2)</option>
        </select>

        <div className="modal-buttons">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit} className="btn-primary">Create Rule</button>
        </div>
      </div>
    </div>
  );
}
