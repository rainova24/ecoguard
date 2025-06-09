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
  writeBatch
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
  refreshData: () => void;
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

  const fetchData = () => {
    const reportsQuery = query(collection(db, 'reports'));
    onSnapshot(reportsQuery, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Report[];
      setReports(reportsData);
    });

    const rewardsQuery = query(collection(db, 'rewards'));
    onSnapshot(rewardsQuery, (snapshot) => {
      const rewardsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reward[];
      setRewards(rewardsData);
    });

    if (user) {
      const userRewardsQuery = query(collection(db, 'userRewards'), where('user_id', '==', user.id));
      onSnapshot(userRewardsQuery, (snapshot) => {
        const userRewardsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserReward[];
        setUserRewards(userRewardsData);
      });
    } else {
      setUserRewards([]);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [user]);
  
  const refreshData = () => {
    fetchData();
  };

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

  const value: DataContextType = {
    reports,
    rewards,
    userRewards,
    createReport,
    updateReportStatus,
    redeemReward,
    cancelReport,
    refreshData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};