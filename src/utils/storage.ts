import { User, Report, Reward, UserReward, AuditLog } from '../types';

// Local storage keys
const STORAGE_KEYS = {
  USERS: 'ecoguard_users',
  REPORTS: 'ecoguard_reports', 
  REWARDS: 'ecoguard_rewards',
  USER_REWARDS: 'ecoguard_user_rewards',
  AUDIT_LOGS: 'ecoguard_audit_logs',
  CURRENT_USER: 'ecoguard_current_user',
  AUTH_TOKEN: 'ecoguard_auth_token'
};

// Generic storage functions
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// User storage functions
export const getUsers = (): User[] => getFromStorage<User>(STORAGE_KEYS.USERS);

export const saveUser = (user: User): void => {
  const users = getUsers();
  const existingIndex = users.findIndex(u => u.id === user.id);
  
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  
  saveToStorage(STORAGE_KEYS.USERS, users);
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(u => u.email === email) || null;
};

export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
};

// Report storage functions
export const getReports = (): Report[] => getFromStorage<Report>(STORAGE_KEYS.REPORTS);

export const saveReport = (report: Report): void => {
  const reports = getReports();
  const existingIndex = reports.findIndex(r => r.id === report.id);
  
  if (existingIndex >= 0) {
    reports[existingIndex] = report;
  } else {
    reports.push(report);
  }
  
  saveToStorage(STORAGE_KEYS.REPORTS, reports);
};

export const getReportsByUserId = (userId: string): Report[] => {
  const reports = getReports();
  return reports.filter(r => r.user_id === userId);
};

// Reward storage functions
export const getRewards = (): Reward[] => {
  const stored = getFromStorage<Reward>(STORAGE_KEYS.REWARDS);
  if (stored.length === 0) {
    // Initialize with default rewards
    const defaultRewards: Reward[] = [
      {
        id: '1',
        name: 'Eco Warrior Badge',
        description: 'Complete your first waste report',
        points_required: 10,
        category: 'badge'
      },
      {
        id: '2', 
        name: 'Green Champion',
        description: 'Report 10 waste locations',
        points_required: 100,
        category: 'badge'
      },
      {
        id: '3',
        name: 'Coffee Shop Discount',
        description: '10% discount at partner cafes',
        points_required: 50,
        category: 'discount'
      },
      {
        id: '4',
        name: 'Eco-friendly Water Bottle',
        description: 'Reusable steel water bottle',
        points_required: 200,
        category: 'item'
      }
    ];
    saveToStorage(STORAGE_KEYS.REWARDS, defaultRewards);
    return defaultRewards;
  }
  return stored;
};

export const getUserRewards = (): UserReward[] => getFromStorage<UserReward>(STORAGE_KEYS.USER_REWARDS);

export const saveUserReward = (userReward: UserReward): void => {
  const userRewards = getUserRewards();
  userRewards.push(userReward);
  saveToStorage(STORAGE_KEYS.USER_REWARDS, userRewards);
};

// Audit log functions
export const getAuditLogs = (): AuditLog[] => getFromStorage<AuditLog>(STORAGE_KEYS.AUDIT_LOGS);

export const saveAuditLog = (log: AuditLog): void => {
  const logs = getAuditLogs();
  logs.push(log);
  // Keep only last 1000 logs
  if (logs.length > 1000) {
    logs.splice(0, logs.length - 1000);
  }
  saveToStorage(STORAGE_KEYS.AUDIT_LOGS, logs);
};

// Current user session
export const getCurrentUser = (): User | null => {
  const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userData ? JSON.parse(userData) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

export const setAuthToken = (token: string | null): void => {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }
};

// Clear all data (for logout)
export const clearUserSession = (): void => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};