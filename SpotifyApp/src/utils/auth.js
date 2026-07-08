// src/utils/auth.js

export const initializeDefaultUsers = () => {
  const users = localStorage.getItem('users');
  if (!users) {
    const defaultUsers = [
      {
        id: '1',
        email: 'reihane@gmail.com',
        password: 'Test123!',
        displayName: 'Test Listener',
        userType: 'listener',
        username: 'listener_1',
        birthDate: '1995-01-01',
        gender: 'prefer-not-to-say',
        subscription: 'gold',
        profileImage: null,
        followers: 0,
        following: 0,
        dailyStreams: 0,
        createdAt: new Date().toISOString()
      },
      {
        id: 'artist-1',
        email: 'artist@test.com',
        password: 'Test123!',
        artistName: 'Nova Waves',
        userType: 'artist',
        username: 'artist_1',
        isVerified: true,
        status: 'approved',
        portfolioLinks: ['https://soundcloud.com/novawaves', 'https://www.instagram.com/novawaves'],
        bio: 'A passionate musician',
        profileImage: null,
        followers: 1250,
        following: 12,
        totalStreams: 45000,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        email: 'admin@test.com',
        password: 'Admin123!',
        displayName: 'Admin User',
        userType: 'admin',
        role: 'admin',
        username: 'admin_1',
        createdAt: new Date().toISOString()
      },
      // ۴. پشتیبان اول
      { 
        id: 'sup-1', 
        username: 'support1', 
        email: 'sup1@spotify.com', 
        password: '123', 
        userType: 'support', 
        role: 'support', 
        displayName: 'Support Ali',
        createdAt: new Date().toISOString()
      },
      // ۵. پشتیبان دوم
      { 
        id: 'sup-2', 
        username: 'support2', 
        email: 'sup2@spotify.com', 
        password: '123', 
        userType: 'support', 
        role: 'support', 
        displayName: 'Support Sara',
        createdAt: new Date().toISOString()
      },
      // ۶. پشتیبان سوم
      { 
        id: 'sup-3', 
        username: 'support3', 
        email: 'sup3@spotify.com', 
        password: '123', 
        userType: 'support', 
        role: 'support', 
        displayName: 'Support Reza',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }
};

const generateUsername = (userType, existingUsers) => {
  const count = existingUsers.filter(u => u.userType === userType).length;
  return `${userType}_${count + 1}`;
};

export const loginUser = async (email, password) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  initializeDefaultUsers();
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    const token = btoa(JSON.stringify({ userId: user.id, email: user.email, exp: Date.now() + 86400000 }));
    const safeUser = { ...user };
    delete safeUser.password;
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(safeUser));

    return {
      success: true,
      token,
      user: safeUser,
      message: 'Login successful'
    };
  }

  return {
    success: false,
    message: 'Invalid email or password'
  };
};

export const registerUser = async (userData) => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  initializeDefaultUsers();
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  if (users.some(u => u.email === userData.email)) {
    return {
      success: false,
      message: 'Email already registered'
    };
  }

  const newUser = {
    id: Date.now().toString(),
    email: userData.email,
    password: userData.password,
    displayName: userData.displayName,
    userType: 'listener',
    username: generateUsername('listener', users),
    birthDate: userData.birthDate,
    gender: userData.gender,
    subscription: 'free',
    profileImage: null,
    followers: 0,
    following: 0,
    dailyStreams: 0,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  return {
    success: true,
    message: 'Registration successful'
  };
};

export const apiChangePassword = (username, currentPassword, newPassword) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const idx = users.findIndex((u) => u.username === username);
  
  if (idx === -1) return { success: false, message: 'User not found.' };
  if (users[idx].password !== currentPassword) return { success: false, message: 'Current password is incorrect.' };

  users[idx].password = newPassword;
  localStorage.setItem('users', JSON.stringify(users));
  return { success: true };
};

export const apiDeleteAccount = (username) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const filtered = users.filter((u) => u.username !== username);
  localStorage.setItem('users', JSON.stringify(filtered));
  return { success: true };
};

export const registerArtist = async (artistData) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  initializeDefaultUsers();
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  
  if (users.some(u => u.email === artistData.email)) {
    return {
      success: false,
      message: 'Email already registered'
    };
  }

  const newArtist = {
    id: Date.now().toString(),
    email: artistData.email,
    password: artistData.password,
    artistName: artistData.artistName,
    userType: 'artist',
    username: generateUsername('artist', users),
    isVerified: false,
    status: 'pending',
    portfolioLinks: artistData.portfolioLinks || [],
    bio: artistData.bio || '',
    profileImage: null,
    followers: 0,
    totalStreams: 0,
    createdAt: new Date().toISOString()
  };

  users.push(newArtist);
  localStorage.setItem('users', JSON.stringify(users));

  return {
    success: true,
    message: 'Artist registration submitted. Waiting for approval.',
    requiresApproval: true
  };
};

export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;
  try {
    const decoded = JSON.parse(atob(token));
    return decoded.exp > Date.now();
  } catch {
    return false;
  }
};

export const getCurrentUser = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export function updateCurrentUser(updates) {
  const current = getCurrentUser();
  if (!current) return null;

  const updated = { ...current, ...updates };

  //localStorage.setItem('currentUser', JSON.stringify(updated));
  localStorage.setItem('currentUser', JSON.stringify(updated));
  
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const idx = users.findIndex((u) => u.username === updated.username);
  if (idx !== -1) {
    // This ensures the password is actually saved alongside the user
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem('users', JSON.stringify(users));
  }

  return updated;
}