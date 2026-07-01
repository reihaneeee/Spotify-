// src/utils/localStorage.js

export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const getAllUsers = () => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

export const setAllUsers = (users) => {
  localStorage.setItem('users', JSON.stringify(users));
};

export const updateCurrentUser = (updatedUser) => {
  setCurrentUser(updatedUser);
  
  const allUsers = getAllUsers();
  const userIndex = allUsers.findIndex(u => u.username === updatedUser.username);
  
  if (userIndex !== -1) {
    allUsers[userIndex] = updatedUser;
    setAllUsers(allUsers);
  }
  
  return updatedUser;
};

export const deleteCurrentUser = () => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  const allUsers = getAllUsers();
  const filteredUsers = allUsers.filter(u => u.username !== currentUser.username);
  setAllUsers(filteredUsers);
  
  localStorage.removeItem('currentUser');
  
  return true;
};

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

export const changeSubscription = (newPlan) => {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  currentUser.subscription = newPlan;
  updateCurrentUser(currentUser);
  
  return true;
};

export const isLoggedIn = () => {
  return getCurrentUser() !== null;
};

export const logout = () => {
  localStorage.removeItem('currentUser');
};
