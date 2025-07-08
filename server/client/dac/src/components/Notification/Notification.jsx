import React from 'react';
import './Notification.css';

const Notification = ({ message, type, show }) => {
  return (
    <div className={`notify ${show ? 'active' : ''}`}>
      <span className={type}>{message}</span>
    </div>
  );
};

export default Notification;
