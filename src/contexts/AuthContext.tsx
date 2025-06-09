import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Import dari file firebase.ts kita
import { User, AuthContextType } from '../types'; // Tipe data kita tetap sama

// Kita tidak lagi butuh file-file ini untuk autentikasi
// import { v4 as uuidv4 } from 'uuid';
// import { hashPassword, verifyPassword, sanitizeInput, isValidEmail, isStrongPassword, checkRateLimit } from '../utils/security';
// import { getUserByEmail, saveUser, getCurrentUser, setCurrentUser, clearUserSession, setAuthToken, saveAuditLog } from '../utils/storage';

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

  // 2. Listener status autentikasi dari Firebase
  // Ini adalah "jantung" dari sistem login kita yang baru.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Pengguna berhasil login (dari Firebase Auth)
        // Sekarang, kita ambil data profilnya dari database Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          // Gabungkan data dari Auth dan Firestore menjadi satu objek User
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            ...userDoc.data(),
          } as User);
        }
      } else {
        // Pengguna logout
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup listener saat komponen di-unmount
    return () => unsubscribe();
  }, []);

  // 3. Fungsi register BARU menggunakan Firebase
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      // Buat pengguna di Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Setelah berhasil, simpan data profil tambahan di Firestore
      const newUser: Omit<User, 'id'> = {
        username,
        email,
        role: 'user',
        points: 0,
        created_at: new Date().toISOString(),
      };
      
      // Gunakan UID dari Auth sebagai ID dokumen di Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

      await signOut(auth);
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      // Anda bisa menambahkan penanganan error yang lebih baik di sini
      return false;
    }
  };

  // 4. Fungsi login BARU menggunakan Firebase
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged akan otomatis menangani pembaruan state user
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // 5. Fungsi logout BARU menggunakan Firebase
  const logout = () => {
    signOut(auth);
    // onAuthStateChanged akan otomatis membersihkan state user
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};