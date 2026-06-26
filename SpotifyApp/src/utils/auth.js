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
        id: '2',
        email: 'artist@test.com',
        password: 'Test123!',
        artistName: 'Test Artist',
        userType: 'artist',
        username: 'artist_1',
        isVerified: true,
        bio: 'A passionate musician',
        profileImage: null,
        followers: 1250,
        totalStreams: 45000,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        email: 'admin@test.com',
        password: 'Admin123!',
        displayName: 'Admin User',
        userType: 'admin',
        username: 'admin_1',
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
  localStorage.removeItem('userData');
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
  localStorage.setItem('userData', JSON.stringify(updated));

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const idx = users.findIndex((u) => u.username === updated.username);
  if (idx !== -1) {
    // This ensures the password is actually saved alongside the user
    users[idx] = { ...users[idx], ...updates };
    localStorage.setItem('users', JSON.stringify(users));
  }

  return updated;
}