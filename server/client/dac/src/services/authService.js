import { apiPost } from './api.js';

export const checkSession = async () => {
  try {
    const data = await apiPost('/api/auth/session');
    return data.isValid;
  } catch (err) {
    console.error('Session check failed:', err);
    return false;
  }
};

export const login = async (username, password) => {
  try {
    const data = await apiPost('/api/auth/login', { username, password });
    return { success: true, userId: data.userId };
  } catch (err) {
    console.error('Login error:', err.message);
    return { success: false, error: err.message };
  }
};

export const setUserId = (userId) => localStorage.setItem('userId', userId);
export const getUserId = () => localStorage.getItem('userId');
