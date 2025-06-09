import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { MapPin, Award, CheckCircle, Clock, XCircle, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { reports, userRewards } = useData();

  if (!user) return null;

  const userReports = reports.filter(report => report.user_id === user.id);
  const pendingReports = userReports.filter(report => report.status === 'pending');
  const resolvedReports = userReports.filter(report => report.status === 'resolved');
  const rejectedReports = userReports.filter(report => report.status === 'rejected');

  const stats = [
    {
      title: 'Total Reports',
      value: userReports.length,
      icon: MapPin,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Points',
      value: user.points,
      icon: Award,
      color: 'bg-emerald-500',
      change: '+8%'
    },
    {
      title: 'Resolved Reports',
      value: resolvedReports.length,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+15%'
    },
    {
      title: 'Pending Reports',
      value: pendingReports.length,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-3%'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.username}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your environmental impact summary
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Reports */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Reports</h2>
              <span className="text-sm text-gray-500">{userReports.length} total</span>
            </div>
            
            <div className="space-y-4">
              {userReports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(report.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {report.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(report.timestamp), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                </div>
              ))}
              
              {userReports.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No reports yet. Start making a difference!</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Rewards */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Reward History</h2>
              <span className="text-sm text-gray-500">{userRewards.length} redeemed</span>
            </div>
            
            <div className="space-y-4">
              {userRewards.slice(0, 5).map((reward) => (
                <div key={reward.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <Award className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {reward.reward_item}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(reward.redeemed_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="text-sm font-medium text-emerald-600">
                      -{reward.points_redeemed} pts
                    </span>
                  </div>
                </div>
              ))}
              
              {userRewards.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No rewards redeemed yet. Check out available rewards!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievement Progress */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Achievement Progress</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-emerald-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{userReports.length}</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mt-4">Reporter</h3>
              <p className="text-sm text-gray-600">Total reports submitted</p>
            </div>
            
            <div className="text-center">
              <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{resolvedReports.length}</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mt-4">Problem Solver</h3>
              <p className="text-sm text-gray-600">Reports resolved</p>
            </div>
            
            <div className="text-center">
              <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                  <Award className="h-8 w-8 text-orange-500" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{user.points}</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mt-4">Point Collector</h3>
              <p className="text-sm text-gray-600">Total points earned</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;