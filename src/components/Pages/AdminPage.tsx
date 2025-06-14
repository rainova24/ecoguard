import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { User, Reward } from '../../types';
import { Shield, Users, MapPin, Award, Plus, X } from 'lucide-react';
import { format } from 'date-fns';

const initialRewardState: Omit<Reward, 'id'> = {
  name: '',
  description: '',
  points_required: 0,
  category: 'item',
  image_url: ''
};

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    reports, updateReportStatus, 
    rewards, createReward, updateReward, deleteReward 
  } = useData();
  const [activeTab, setActiveTab] = useState<'reports' | 'users' | 'rewards'>('reports');
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [currentReward, setCurrentReward] = useState<Partial<Reward> | null>(null);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    const usersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[]);
    });
    return () => unsubscribe();
  }, [user]);

  const handleOpenRewardModal = (reward: Reward | null = null) => {
    setCurrentReward(reward ? { ...reward } : { ...initialRewardState });
    setIsRewardModalOpen(true);
  };

  const handleCloseRewardModal = () => {
    setCurrentReward(null);
    setIsRewardModalOpen(false);
  };

  const handleRewardFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentReward(prev => prev ? { ...prev, [name]: name === 'points_required' ? Number(value) : value } : null);
  };

  const handleRewardFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReward || !currentReward.name || !currentReward.description) return;
    
    if (currentReward.id) {
      const { id, ...rewardData } = currentReward;
      await updateReward(id, rewardData);
    } else {
      await createReward(currentReward as Omit<Reward, 'id'>);
    }
    handleCloseRewardModal();
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus hadiah ini?')) {
      await deleteReward(rewardId);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'reports', label: 'Reports', icon: MapPin },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'rewards', label: 'Manage Rewards', icon: Award },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage users, reports, and rewards</p>
        </div>
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Manage Reports</h2>
            <div className="space-y-4">
              {reports.map((report) => {
                const reporter = allUsers.find(u => u.id === report.user_id);
                return (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{report.description}</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Reporter: {reporter ? reporter.username : 'Loading...'}</p>
                          <p>Location: {report.location.fullAddress}</p>
                          <p>Date: {format(new Date(report.timestamp), 'MMM d, yyyy HH:mm')}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => updateReportStatus(report.id, 'resolved', report.user_id)} disabled={report.status === 'resolved'} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">Approve</button>
                      <button onClick={() => updateReportStatus(report.id, 'rejected', report.user_id)} disabled={report.status === 'rejected'} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50">Reject</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">User Management</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allUsers.map((user) => {
                    const userReportsCount = reports.filter(r => r.user_id === user.id).length;
                    return (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{user.username}</div><div className="text-sm text-gray-500">{user.email}</div></td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>{user.role}</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.points}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{userReportsCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(user.created_at), 'MMM d, yyyy')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Manage Rewards</h2>
              <button onClick={() => handleOpenRewardModal()} className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-emerald-600">
                <Plus className="h-5 w-5" />
                <span>Add Reward</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium">Name</th>
                    <th className="py-3 px-4 text-left font-medium">Category</th>
                    <th className="py-3 px-4 text-left font-medium">Points</th>
                    <th className="py-3 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rewards.map(reward => (
                    <tr key={reward.id}>
                      <td className="py-3 px-4">{reward.name}</td>
                      <td className="py-3 px-4">{reward.category}</td>
                      <td className="py-3 px-4">{reward.points_required}</td>
                      <td className="py-3 px-4 space-x-4">
                        <button onClick={() => handleOpenRewardModal(reward)} className="text-blue-600 hover:underline font-medium">Edit</button>
                        <button onClick={() => handleDeleteReward(reward.id)} className="text-red-600 hover:underline font-medium">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {isRewardModalOpen && currentReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <form onSubmit={handleRewardFormSubmit} className="flex flex-col">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold">{currentReward.id ? 'Edit Reward' : 'Add New Reward'}</h3>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Reward Name</label>
                  <input type="text" name="name" id="name" value={currentReward.name || ''} onChange={handleRewardFormChange} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                  <textarea name="description" id="description" value={currentReward.description || ''} onChange={handleRewardFormChange} rows={3} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label htmlFor="points_required" className="block text-sm font-medium mb-1">Points Required</label>
                  <input type="number" name="points_required" id="points_required" value={currentReward.points_required || 0} onChange={handleRewardFormChange} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
                  <select name="category" id="category" value={currentReward.category || 'item'} onChange={handleRewardFormChange} className="w-full px-3 py-2 border rounded-lg bg-white" required>
                    <option value="item">Item & Donasi</option>
                    <option value="badge">Lencana Digital</option>
                    <option value="discount">Diskon</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="image_url" className="block text-sm font-medium mb-1">Image URL (Optional)</label>
                  <input type="text" name="image_url" id="image_url" value={currentReward.image_url || ''} onChange={handleRewardFormChange} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="p-4 bg-gray-50 flex justify-end space-x-3 rounded-b-xl border-t">
                <button type="button" onClick={handleCloseRewardModal} className="px-4 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">Save Reward</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;