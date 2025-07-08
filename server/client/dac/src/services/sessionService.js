import { checkSession } from './authService';
import { useNavigate } from 'react-router-dom';
import { useNotifier } from '../components/Notification/NotificationContext';
import { useEffect } from 'react';

export const ValidateSession = () => {
  const navigate = useNavigate();
  const notify = useNotifier();

  useEffect(() => {
    (async () => {
      const isValid = await checkSession();
      if (!isValid) {
        notify('Session Expired','failure');
        navigate('/');
      }
    })();
  }, [navigate,notify]);
};
