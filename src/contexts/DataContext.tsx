import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  increment,
  query,
  where,
  writeBatch,
  deleteDoc
} from 'firebase/firestore';
import { Report, Reward, UserReward } from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  reports: Report[];
  rewards: Reward[];
  userRewards: UserReward[];
  createReport: (reportData: Omit<Report, 'id' | 'user_id' | 'timestamp' | 'status'>) => Promise<void>;
  updateReportStatus: (reportId: string, status: Report['status'], reportUserId: string) => Promise<void>;
  redeemReward: (rewardId: string) => Promise<boolean>;
  cancelReport: (reportId: string, userId: string) => Promise<void>;
  // Fungsi CRUD Baru untuk Rewards
  createReward: (rewardData: Omit<Reward, 'id'>) => Promise<void>;
  updateReward: (rewardId: string, rewardData: Partial<Reward>) => Promise<void>;
  deleteReward: (rewardId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);

  useEffect(() => {
    // Listener untuk Laporan
    const reportsQuery = query(collection(db, 'reports'));
    const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Report[]);
    });

    // Listener untuk Hadiah
    const rewardsQuery = query(collection(db, 'rewards'));
    const unsubscribeRewards = onSnapshot(rewardsQuery, (snapshot) => {
      setRewards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reward[]);
    });

    // Listener untuk Hadiah Pengguna
    let unsubscribeUserRewards = () => {};
    if (user) {
      const userRewardsQuery = query(collection(db, 'userRewards'), where('user_id', '==', user.id));
      unsubscribeUserRewards = onSnapshot(userRewardsQuery, (snapshot) => {
        setUserRewards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserReward[]);
      });
    } else {
      setUserRewards([]);
    }

    return () => {
      unsubscribeReports();
      unsubscribeRewards();
      unsubscribeUserRewards();
    };
  }, [user]);
  
  const createReport = async (reportData: Omit<Report, 'id' | 'user_id' | 'timestamp' | 'status'>) => {
    if (!user) return;
    const newReport = {
      user_id: user.id,
      timestamp: new Date().toISOString(),
      status: 'pending' as 'pending',
      ...reportData,
    };
    await addDoc(collection(db, 'reports'), newReport);
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, {
      points: increment(10),
    });
  };

  const updateReportStatus = async (reportId: string, status: Report['status'], reportUserId: string) => {
    const reportDocRef = doc(db, 'reports', reportId);
    await updateDoc(reportDocRef, { status });
  
    if (status === 'resolved') {
      const userDocRef = doc(db, 'users', reportUserId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data().role !== 'admin') {
        await updateDoc(userDocRef, {
          points: increment(15),
        });
      }
    }
  };
  
  const redeemReward = async (rewardId: string): Promise<boolean> => {
    if (!user) return false;
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || user.points < reward.points_required) return false;

    const batch = writeBatch(db);
    const newUserRewardRef = doc(collection(db, 'userRewards'));
    const newUserReward: Omit<UserReward, 'id'> = {
        user_id: user.id,
        reward_id: rewardId,
        points_redeemed: reward.points_required,
        reward_item: reward.name,
        redeemed_at: new Date().toISOString()
    };
    batch.set(newUserRewardRef, newUserReward);
    
    const userDocRef = doc(db, 'users', user.id);
    batch.update(userDocRef, {
        points: increment(-reward.points_required)
    });
    
    await batch.commit();
    return true;
  };

  const cancelReport = async (reportId: string, userId: string) => {
    if (!user || user.id !== userId) return;

    const batch = writeBatch(db);
    const reportDocRef = doc(db, 'reports', reportId);
    batch.delete(reportDocRef);

    const userDocRef = doc(db, 'users', userId);
    batch.update(userDocRef, {
      points: increment(-10)
    });

    await batch.commit();
  };
  
  // --- FUNGSI CRUD BARU UNTUK REWARDS ---
  const createReward = async (rewardData: Omit<Reward, 'id'>) => {
    await addDoc(collection(db, 'rewards'), rewardData);
  };

  const updateReward = async (rewardId: string, rewardData: Partial<Reward>) => {
    const rewardDocRef = doc(db, 'rewards', rewardId);
    await updateDoc(rewardDocRef, rewardData);
  };

  const deleteReward = async (rewardId: string) => {
    const rewardDocRef = doc(db, 'rewards', rewardId);
    await deleteDoc(rewardDocRef);
  };

  const value = {
    reports,
    rewards,
    userRewards,
    createReport,
    updateReportStatus,
    redeemReward,
    cancelReport,
    createReward,
    updateReward,
    deleteReward,
  };

  return <DataContext.Provider value={value as DataContextType}>{children}</DataContext.Provider>;
};