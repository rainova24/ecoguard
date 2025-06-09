import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useData } from '../../contexts/DataContext';
import { getUserById } from '../../utils/storage';
import { MapPin, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const pendingIcon = createCustomIcon('#EAB308');
const resolvedIcon = createCustomIcon('#10B981');
const rejectedIcon = createCustomIcon('#EF4444');

const MapPage: React.FC = () => {
  const { reports } = useData();
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.2088, 106.8456]); // Jakarta coordinates

  useEffect(() => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          // Keep default coordinates if geolocation fails
        }
      );
    }
  }, []);

  const getMarkerIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return pendingIcon;
      case 'resolved':
        return resolvedIcon;
      case 'rejected':
        return rejectedIcon;
      default:
        return pendingIcon;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'resolved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    rejected: reports.filter(r => r.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Community Map</h1>
              <p className="text-gray-600 mt-2">
                View all reported waste locations across the community
              </p>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 lg:mt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Reports</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-sm text-gray-600">Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border-b px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center space-x-6">
            <span className="text-sm font-medium text-gray-700">Legend:</span>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow"></div>
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow"></div>
              <span className="text-sm text-gray-600">Resolved</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
              <span className="text-sm text-gray-600">Rejected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1" style={{ height: 'calc(100vh - 200px)' }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {reports.map((report) => {
            const reporter = getUserById(report.user_id);
            return (
              <Marker
                key={report.id}
                position={[report.location.lat, report.location.lng]}
                icon={getMarkerIcon(report.status)}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-64">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">Waste Report</h3>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(report.status)}
                        <span className={`text-sm font-medium capitalize ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700">{report.description}</p>
                      
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{report.location.address || 'Location recorded'}</span>
                      </div>
                      
                      {reporter && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          <span>Reported by {reporter.username}</span>
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        {new Date(report.timestamp).toLocaleDateString()} at{' '}
                        {new Date(report.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;