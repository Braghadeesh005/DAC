import { apiPost } from './api.js';
import routes from '../../../../apiRoutes.json';

export const checkSession = async () => {
  try {
    const data = await apiPost(routes.BACKEND_SESSION_API);
    return data.isValid;
  } catch (err) {
    console.error('Session check failed:', err);
    return false;
  }
};

export const login = async (username, password) => {
  try {
    const data = await apiPost(routes.BACKEND_LOGIN_API, { username, password });
    return { success: true, userId: data.userId };
  } catch (err) {
    console.error('Login error:', err.message);
    return { success: false, error: err.message };
  }
};

export const logout = async () => {
  try {
    const data = await apiPost(routes.BACKEND_LOGOUT_API);
    return { success: true, userId: data.userId };
  } catch (err) {
    console.error('Logout error:', err.message);
    return { success: false, error: err.message };
  }
};

export const setUserId = (userId) => localStorage.setItem('userId', userId);
export const getUserId = () => localStorage.getItem('userId');
