import React from 'react';
import '../styles/setting_PMG_model.css';

function PMGConnectionModal({ visible, onClose, onConfirm }) {
  if (!visible) return null;

  return (
    <div className="pmg-modal-overlay">
      <div className="pmg-modal">
        {/* Close Button */}
        <button onClick={onClose} className="pmg-close-button">
          &times;
        </button>

        {/* Icon */}
        <div className="pmg-icon"></div>

        <h2 className="pmg-title">PMG Connection</h2>

        <div className="pmg-form">
          <div className="pmg-form-group">
            <label className="pmg-label">PMG HostName/IP</label>
            <input
              type="text"
              placeholder="Example : https://192.168.11.11:8006"
              className="pmg-input"
            />
          </div>

          <div className="pmg-form-group">
            <label className="pmg-label">PMG Username</label>
            <input
              type="text"
              placeholder="Example: root@pam"
              className="pmg-input"
            />
          </div>

          <div className="pmg-form-group">
            <label className="pmg-label">PMG API Token</label>
            <input
              type="text"
              placeholder="Example : root@pam:abcd1234....."
              className="pmg-input"
            />
          </div>

          <div className="pmg-form-group">
            <label className="pmg-label">Status</label>
            <input
              type="text"
              value="Not tested"
              disabled
              className="pmg-input disabled"
            />
          </div>

          <button className="pmg-btn-confirm test" style={{ marginTop: '16px' }}>
            Test Connection
          </button>

          <div className="pmg-buttons">
            <button className="pmg-btn-cancel" onClick={onClose}>Cancel</button>
            <button className="pmg-btn-confirm" onClick={onConfirm}>Confirm</button>
          </div>

          
        </div>
      </div>
    </div>
  );
}

export default PMGConnectionModal;
