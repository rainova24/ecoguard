import React, { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Report, Reward, UserReward } from '../types';
import { useAuth } from './AuthContext';
import {
  getReports,
  saveReport,
  getRewards,
  getUserRewards,
  saveUserReward,
  saveUser,
  getUserById
} from '../utils/storage';

interface DataContextType {
  reports: Report[];
  rewards: Reward[];
  userRewards: UserReward[];
  createReport: (reportData: Omit<Report, 'id' | 'user_id' | 'timestamp' | 'status'>) => void;
  updateReportStatus: (reportId: string, status: Report['status']) => void;
  redeemReward: (rewardId: string) => boolean;
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

  const refreshData = () => {
    setReports(getReports());
    setRewards(getRewards());
    setUserRewards(getUserRewards());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const createReport = (reportData: Omit<Report, 'id' | 'user_id' | 'timestamp' | 'status'>) => {
    if (!user) return;

    const newReport: Report = {
      id: uuidv4(),
      user_id: user.id,
      timestamp: new Date().toISOString(),
      status: 'pending',
      ...reportData
    };

    saveReport(newReport);
    
    // Award points for reporting
    const updatedUser = { ...user, points: user.points + 10 };
    saveUser(updatedUser);
    
    refreshData();
  };

  const updateReportStatus = (reportId: string, status: Report['status']) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    const updatedReport = { ...report, status };
    saveReport(updatedReport);

    // Award additional points for resolved reports
    if (status === 'resolved') {
      const reportUser = getUserById(report.user_id);
      if (reportUser) {
        const updatedUser = { ...reportUser, points: reportUser.points + 15 };
        saveUser(updatedUser);
      }
    }

    refreshData();
  };

  const redeemReward = (rewardId: string): boolean => {
    if (!user) return false;

    const reward = rewards.find(r => r.id === rewardId);
    if (!reward || user.points < reward.points_required) {
      return false;
    }

    // Create user reward record
    const newUserReward: UserReward = {
      id: uuidv4(),
      user_id: user.id,
      reward_id: rewardId,
      points_redeemed: reward.points_required,
      reward_item: reward.name,
      redeemed_at: new Date().toISOString()
    };

    saveUserReward(newUserReward);

    // Deduct points from user
    const updatedUser = { ...user, points: user.points - reward.points_required };
    saveUser(updatedUser);

    refreshData();
    return true;
  };

  const value: DataContextType = {
    reports,
    rewards,
    userRewards,
    createReport,
    updateReportStatus,
    redeemReward,
    refreshData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};