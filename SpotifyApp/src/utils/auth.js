import apiClient from '../services/apiClient';

export const registerUser = async (userData) => {
  try {
    const { data } = await apiClient.post('/auth/register/', {
      email: userData.email,
      password: userData.password,
      display_name: userData.displayName,
      birth_date: userData.birthDate,
      gender: userData.gender,
      user_type: 'listener'
    });
    return { success: true, message: 'Registration successful' };
  } catch (error) {
    const errorMsg = error.response?.data?.email?.[0] || error.response?.data?.detail || 'Registration failed';
    return { success: false, message: errorMsg };
  }
};

export const registerArtist = async (artistData) => {
  try {
    const { data } = await apiClient.post('/auth/register/artist/', {
      email: artistData.email,
      password: artistData.password,
      artist_name: artistData.artistName,
      bio: artistData.bio,
      portfolio_links: artistData.portfolioLinks,
      user_type: 'artist'
    });
    return { 
      success: true, 
      message: 'Artist registration submitted. Waiting for approval.',
      requiresApproval: true 
    };
  } catch (error) {
    const errorMsg = error.response?.data?.email?.[0] || error.response?.data?.detail || 'Registration failed';
    return { success: false, message: errorMsg };
  }
};

// تغییر رمز عبور با استفاده از apiClient معتبر پروژه‌تان
export const apiChangePassword = async (oldPassword, newPassword) => {
  try {
    await apiClient.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword
    });
    return { success: true };
  } catch (error) {
    const errorMsg = error.response?.data?.old_password 
      || error.response?.data?.detail 
      || 'Password change failed.';
    const message = Array.isArray(errorMsg) ? errorMsg[0] : errorMsg;
    return { success: false, message };
  }
};

// حذف حساب کاربری با استفاده از apiClient معتبر
export const apiDeleteAccount = async () => {
  try {
    await apiClient.delete('/auth/me/');
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response?.data?.detail || 'Failed to delete account.' };
  }
};

export const loginUser = async () => {
   console.warn("Please use useAuth().login() from AuthContext instead of utils/auth.js");
   return { success: false, message: 'Use Context Login' };
};

export const logoutUser = () => {
  localStorage.clear();
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('accessToken');
  if (!token) return false;
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return (decoded.exp * 1000) > Date.now();
  } catch {
    return false;
  }
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};