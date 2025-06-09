import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Leaf, MapPin, Award, Shield, Users, Zap } from 'lucide-react';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: MapPin,
      title: 'Report Waste Locations',
      description: 'Easily report illegal dumping sites and waste accumulation areas in your community.',
      color: 'text-emerald-500'
    },
    {
      icon: Shield,
      title: 'Track & Monitor',
      description: 'View real-time updates on reported locations and their cleanup status.',
      color: 'text-blue-500'
    },
    {
      icon: Award,
      title: 'Earn Rewards',
      description: 'Get points for your contributions and redeem them for eco-friendly rewards.',
      color: 'text-orange-500'
    },
    {
      icon: Users,
      title: 'Community Impact',
      description: 'Join thousands of environmental advocates making a real difference.',
      color: 'text-purple-500'
    }
  ];

  const stats = [
    { label: 'Reports Submitted', value: '2,847', icon: MapPin },
    { label: 'Locations Cleaned', value: '1,923', icon: Shield },
    { label: 'Active Users', value: '12,456', icon: Users },
    { label: 'Points Awarded', value: '45,892', icon: Award }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-emerald-500 p-4 rounded-full">
                <Leaf className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Protect Our Environment
              <br />
              <span className="text-emerald-500">Together</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              EcoGuard empowers communities to report waste violations, track cleanup progress, 
              and earn rewards for environmental stewardship. Join the movement for a cleaner planet.
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/reports"
                  className="bg-emerald-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <MapPin className="h-5 w-5" />
                  <span>Submit Report</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="bg-white text-emerald-500 border-2 border-emerald-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-50 transition-colors"
                >
                  View Dashboard
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="bg-emerald-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Zap className="h-5 w-5" />
                  <span>Get Started</span>
                </Link>
                <Link
                  to="/map"
                  className="bg-white text-emerald-500 border-2 border-emerald-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-50 transition-colors"
                >
                  View Map
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <stat.icon className="h-6 w-6 text-emerald-500" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How EcoGuard Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform makes environmental protection accessible, rewarding, and impactful for everyone.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex justify-center mb-6">
                  <div className="bg-gray-100 p-3 rounded-full">
                    <feature.icon className={`h-8 w-8 ${feature.color}`} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of environmental advocates using EcoGuard to create cleaner, healthier communities.
          </p>
          {!user && (
            <Link
              to="/register"
              className="bg-white text-emerald-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
            >
              <span>Join EcoGuard Today</span>
              <Zap className="h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;