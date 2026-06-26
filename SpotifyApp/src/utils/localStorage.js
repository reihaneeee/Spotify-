// src/utils/localStorage.js

// دریافت کاربر فعلی
export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

// ذخیره کاربر فعلی
export const setCurrentUser = (user) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

// دریافت تمام کاربران
export const getAllUsers = () => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

// ذخیره تمام کاربران
export const setAllUsers = (users) => {
  localStorage.setItem('users', JSON.stringify(users));
};

// بروزرسانی کاربر فعلی در هر دو جای LocalStorage
export const updateCurrentUser = (updatedUser) => {
  // بروزرسانی currentUser
  setCurrentUser(updatedUser);
  
  // بروزرسانی در لیست users
  const allUsers = getAllUsers();
  const userIndex = allUsers.findIndex(u => u.username === updatedUser.username);
  
  if (userIndex !== -1) {
    allUsers[userIndex] = updatedUser;
    setAllUsers(allUsers);
  }
  
  return updatedUser;
};

// حذف کاربر فعلی
export const deleteCurrentUser = () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  // حذف از لیست users
  const allUsers = getAllUsers();
  const filteredUsers = allUsers.filter(u => u.username !== currentUser.username);
  setAllUsers(filteredUsers);
  
  // حذف currentUser
  localStorage.removeItem('currentUser');
  
  return true;
};

// تغییر رمز عبور
export const changePassword = (oldPassword, newPassword) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return { success: false, message: 'User not found' };
  
  if (currentUser.password !== oldPassword) {
    return { success: false, message: 'Old password is incorrect' };
  }
  
  currentUser.password = newPassword;
  updateCurrentUser(currentUser);
  
  return { success: true, message: 'Password changed successfully' };
};

// تغییر نوع اشتراک
export const changeSubscription = (newPlan) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  currentUser.subscription = newPlan;
  updateCurrentUser(currentUser);
  
  return true;
};

// بررسی لاگین بودن
export const isLoggedIn = () => {
  return getCurrentUser() !== null;
};

// خروج از حساب
export const logout = () => {
  localStorage.removeItem('currentUser');
};
