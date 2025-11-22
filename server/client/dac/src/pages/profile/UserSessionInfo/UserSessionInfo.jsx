import React, { useEffect, useState } from 'react';
import MainLayout from '../../../layouts/MainLayout';
import Table from '../../../components/Table/Table';
import { apiPost } from '../../../services/api';
import { getUserId } from '../../../services/authService';
import Loader from '../../../components/Loader/Loader';

const UserSessionInfo = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
  try {
    const userId = getUserId();
    const res = await apiPost('/api/auth/allSessions', { userId });
    let sessions = res.sessionsList || [];
    sessions = sessions.map((session) => {
      const formattedSession = { ...session };

      ['LOGIN_TIME', 'LAST_ACCESS_TIME'].forEach((key) => {
        if (formattedSession[key]) {
          const epoch = Number(formattedSession[key]);
          const date = new Date(epoch < 1e12 ? epoch * 1000 : epoch);
          formattedSession[key] = date.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour12: true,
          });
        }
      });

      return formattedSession;
    });

    const sampleRow = sessions?.[0];
    if (sampleRow) {
      const dynamicHeaders = Object.keys(sampleRow);
      setHeaders(dynamicHeaders);
    }

    setData(sessions);
  } catch (err) {
    console.error('Error fetching session info:', err.message);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <MainLayout>
      <div>
        <h2 className='header'>User Session Info</h2>
        {loading ? <Loader /> : <Table headers={headers} data={data} />}
      </div>
    </MainLayout>
  );
};

export default UserSessionInfo;
