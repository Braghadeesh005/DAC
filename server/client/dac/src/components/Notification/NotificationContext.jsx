import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from './Notification';

const NotificationContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifier = () => useContext(NotificationContext);

const NotificationProvider = ({ children }) => {
  const [notif, setNotif] = useState({ message: '', type: '', show: false });
  const notify = useCallback((message, type = 'success') => {
    setNotif({ message, type, show: true });
    setTimeout(() => {
      setNotif((prev) => ({ ...prev, show: false }));
    }, 5000);
  }, []);

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <Notification message={notif.message} type={notif.type} show={notif.show} />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
