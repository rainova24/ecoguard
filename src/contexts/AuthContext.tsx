import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { User, AuthContextType, AuditLog } from '../types';
import { hashPassword, verifyPassword, sanitizeInput, isValidEmail, isStrongPassword, checkRateLimit } from '../utils/security';
import { 
  getUserByEmail, 
  saveUser, 
  getCurrentUser, 
  setCurrentUser, 
  clearUserSession,
  setAuthToken,
  saveAuditLog 
} from '../utils/storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from storage on app start
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const createAuditLog = (action: string, details: string, userId?: string) => {
    const log: AuditLog = {
      id: uuidv4(),
      user_id: userId || user?.id || 'anonymous',
      action,
      details,
      timestamp: new Date().toISOString(),
      ip_address: 'localhost' // In production, get real IP
    };
    saveAuditLog(log);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Rate limiting check
      if (!checkRateLimit(`login_${email}`, 5, 300000)) { // 5 attempts per 5 minutes
        createAuditLog('LOGIN_RATE_LIMITED', `Rate limit exceeded for email: ${email}`);
        throw new Error('Too many login attempts. Please try again later.');
      }

      const sanitizedEmail = sanitizeInput(email).toLowerCase();
      
      if (!isValidEmail(sanitizedEmail)) {
        throw new Error('Invalid email format');
      }

      const existingUser = getUserByEmail(sanitizedEmail);
      if (!existingUser) {
        createAuditLog('LOGIN_FAILED', `Login attempt with non-existent email: ${sanitizedEmail}`);
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await verifyPassword(password, existingUser.password_hash || '');
      if (!isPasswordValid) {
        createAuditLog('LOGIN_FAILED', `Invalid password for user: ${existingUser.id}`, existingUser.id);
        throw new Error('Invalid credentials');
      }

      // Generate auth token (in production, use JWT)
      const authToken = `token_${uuidv4()}_${Date.now()}`;
      
      setUser(existingUser);
      setCurrentUser(existingUser);
      setAuthToken(authToken);
      
      createAuditLog('LOGIN_SUCCESS', `User logged in successfully`, existingUser.id);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      // Rate limiting check
      if (!checkRateLimit(`register_${email}`, 3, 3600000)) { // 3 attempts per hour
        createAuditLog('REGISTER_RATE_LIMITED', `Rate limit exceeded for email: ${email}`);
        throw new Error('Too many registration attempts. Please try again later.');
      }

      const sanitizedUsername = sanitizeInput(username);
      const sanitizedEmail = sanitizeInput(email).toLowerCase();

      // Validation
      if (!sanitizedUsername || sanitizedUsername.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      if (!isValidEmail(sanitizedEmail)) {
        throw new Error('Invalid email format');
      }

      if (!isStrongPassword(password)) {
        throw new Error('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
      }

      // Check if user already exists
      const existingUser = getUserByEmail(sanitizedEmail);
      if (existingUser) {
        createAuditLog('REGISTER_FAILED', `Registration attempt with existing email: ${sanitizedEmail}`);
        throw new Error('User already exists with this email');
      }

      // Create new user
      const hashedPassword = await hashPassword(password);
      const newUser: User = {
        id: uuidv4(),
        username: sanitizedUsername,
        email: sanitizedEmail,
        role: 'user',
        points: 0,
        created_at: new Date().toISOString(),
        password_hash: hashedPassword
      } as User & { password_hash: string };

      saveUser(newUser);
      
      // Remove password_hash before setting user state
      const { password_hash, ...userWithoutPassword } = newUser;
      
      setUser(userWithoutPassword);
      setCurrentUser(userWithoutPassword);
      
      // Generate auth token
      const authToken = `token_${uuidv4()}_${Date.now()}`;
      setAuthToken(authToken);
      
      createAuditLog('REGISTER_SUCCESS', `New user registered: ${sanitizedUsername}`, newUser.id);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    if (user) {
      createAuditLog('LOGOUT', `User logged out`, user.id);
    }
    setUser(null);
    clearUserSession();
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};