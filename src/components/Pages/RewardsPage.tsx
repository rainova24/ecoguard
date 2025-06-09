import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Award, ShoppingBag, Badge, Percent, Gift, Star, Crown } from 'lucide-react';

const RewardsPage: React.FC = () => {
  const { user } = useAuth();
  const { rewards, userRewards, redeemReward } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!user) return null;

  const categories = [
    { id: 'all', label: 'All Rewards', icon: Gift },
    { id: 'badge', label: 'Badges', icon: Badge },
    { id: 'discount', label: 'Discounts', icon: Percent },
    { id: 'item', label: 'Items', icon: ShoppingBag }
  ];

  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(reward => reward.category === selectedCategory);

  const userRedeemedRewards = userRewards.filter(ur => ur.user_id === user.id);
  const redeemedRewardIds = userRedeemedRewards.map(ur => ur.reward_id);

  const handleRedeem = (rewardId: string) => {
    const success = redeemReward(rewardId);
    if (success) {
      // Success feedback would be handled by the context
    } else {
      alert('Insufficient points or reward unavailable');
    }
  };

  const getRewardIcon = (category: string, size: string = 'h-8 w-8') => {
    switch (category) {
      case 'badge':
        return <Badge className={`${size} text-purple-500`} />;
      case 'discount':
        return <Percent className={`${size} text-blue-500`} />;
      case 'item':
        return <ShoppingBag className={`${size} text-green-500`} />;
      default:
        return <Gift className={`${size} text-gray-500`} />;
    }
  };

  const canRedeem = (pointsRequired: number) => user.points >= pointsRequired;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-full">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reward Store</h1>
          <p className="text-gray-600 mb-4">
            Redeem your points for eco-friendly rewards and exclusive benefits
          </p>
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <Star className="h-6 w-6 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">{user.points}</span>
              <span className="text-gray-600">Points Available</span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-emerald-50'
              }`}
            >
              <category.icon className="h-5 w-5" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredRewards.map((reward) => {
            const isRedeemed = redeemedRewardIds.includes(reward.id);
            const canRedeemReward = canRedeem(reward.points_required);

            return (
              <div
                key={reward.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                  isRedeemed ? 'opacity-75' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full ${
                      reward.category === 'badge' ? 'bg-purple-100' :
                      reward.category === 'discount' ? 'bg-blue-100' :
                      reward.category === 'item' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {getRewardIcon(reward.category)}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                    {reward.name}
                  </h3>
                  
                  <p className="text-gray-600 text-center text-sm mb-4">
                    {reward.description}
                  </p>
                  
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Award className="h-5 w-5 text-emerald-500" />
                    <span className="text-lg font-bold text-emerald-600">
                      {reward.points_required} pts
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleRedeem(reward.id)}
                    disabled={!canRedeemReward || isRedeemed}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      isRedeemed
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : canRedeemReward
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isRedeemed ? 'Redeemed' : canRedeemReward ? 'Redeem' : 'Insufficient Points'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Redemptions */}
        {userRedeemedRewards.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Redemptions</h2>
            <div className="space-y-4">
              {userRedeemedRewards.slice(0, 5).map((redemption) => (
                <div key={redemption.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Award className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium text-gray-900">{redemption.reward_item}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(redemption.redeemed_at).toDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-emerald-600 font-medium">
                    -{redemption.points_redeemed} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredRewards.length === 0 && (
          <div className="text-center py-12">
            <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Rewards Available</h3>
            <p className="text-gray-600">Check back later for new rewards!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsPage;