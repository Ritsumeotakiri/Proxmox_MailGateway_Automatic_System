import React from 'react';
import '../styles/AlertMessage.css';

const AlertMessage = ({ type = 'info', message, onClose }) => {
  return (
    <div className={`alert-box ${type}`}>
      <span className="icon">
        {{
          info: 'ℹ️',
          warning: '⚠️',
          error: '❌',
          success: '✅',
        }[type]}
      </span>
      <span className="message">{message}</span>
      <span className="close" onClick={onClose}>×</span>
    </div>
  );
};

export default AlertMessage;
