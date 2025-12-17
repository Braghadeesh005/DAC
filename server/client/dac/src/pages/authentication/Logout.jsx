import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifier } from '../../components/Notification/NotificationContext';
import { logout, setUserId } from '../../services/authService.js';

const Logout = () => {
  const navigate = useNavigate();
  const notify = useNotifier();

  useEffect(() => {
    (async () => {
      const res = await logout();
      setUserId(null);
      if (res.success) {
        notify('Logged out', 'success');
        navigate('/');
      } else {
        notify(res.error || 'Logout failed', 'failure');
      }
    })();
  }, [navigate, notify]);

  return <div>Logging out...</div>;
};

export default Logout;
