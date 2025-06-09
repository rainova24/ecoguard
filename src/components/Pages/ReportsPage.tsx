import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, Plus, Camera, Save, X } from 'lucide-react';
import { sanitizeInput } from '../../utils/security';

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { reports, createReport } = useData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    location: { lat: 0, lng: 0, address: '' },
    photo_url: ''
  });

  const userReports = user ? reports.filter(report => report.user_id === user.id) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) return;

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const reportData = {
            ...formData,
            description: sanitizeInput(formData.description),
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: formData.location.address || 'Current Location'
            }
          };
          
          createReport(reportData);
          setFormData({ description: '', location: { lat: 0, lng: 0, address: '' }, photo_url: '' });
          setShowForm(false);
        },
        () => {
          // If geolocation fails, use default coordinates
          const reportData = {
            ...formData,
            description: sanitizeInput(formData.description),
            location: {
              lat: -6.2088,
              lng: 106.8456,
              address: formData.location.address || 'Jakarta, Indonesia'
            }
          };
          
          createReport(reportData);
          setFormData({ description: '', location: { lat: 0, lng: 0, address: '' }, photo_url: '' });
          setShowForm(false);
        }
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
            <p className="text-gray-600 mt-2">
              Track your environmental reports and their status
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Report</span>
          </button>
        </div>

        {/* New Report Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Submit New Report</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Describe the waste issue you found..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Location (Optional)
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={formData.location.address}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      location: { ...formData.location, address: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Enter address or leave blank for current location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Photo upload coming soon</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Submit Report</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reports Grid */}
        <div className="grid gap-6">
          {userReports.length > 0 ? (
            userReports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {report.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{report.location.address || 'Location recorded'}</span>
                      </div>
                      <span>{new Date(report.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Report ID: {report.id.slice(0, 8)}</span>
                    <span className="text-gray-600">
                      Location: {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Reports Yet</h3>
              <p className="text-gray-600 mb-6">
                Start making a difference by reporting waste issues in your community.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
              >
                Submit Your First Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;