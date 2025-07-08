import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifier } from '../../components/Notification/NotificationContext';
import Forms from '../../layouts/Forms.jsx';
import { checkSession, login, setUserId } from '../../services/authService.js';
import { PasswordField, TextField } from '../../components/InputFields/InputFields.jsx';

const Login = () => {
  const navigate = useNavigate();
  const notify = useNotifier();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  useEffect(() => {
    (async () => {
      const isValid = await checkSession();
      if (isValid) navigate('/apps/home');
    })();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(username, password);
    if (res.success) {
      setUserId(res.userId);
      notify('Login Successful','success')
      navigate('/apps/home');
    } else {
      notify(res.error || 'Login failed!','failure');
    }
  };

  const labelList = ['Username', 'Password'];

  return (
    <div>
      <Forms labelList={labelList} maxComponentsPerColumn={3} onSubmit={handleSubmit}>
        <TextField  placeholder="Enter Username"  value={username}  onChange={(e) => setUsername(e.target.value)}/>
        <PasswordField  placeholder="Enter Password"  value={password}  onChange={(e) => setPassword(e.target.value)}/>
      </Forms>
    </div>
  );
};

export default Login;