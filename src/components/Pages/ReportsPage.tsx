import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, Plus, Camera, Save, X, Loader2 } from 'lucide-react';
import { sanitizeInput } from '../../utils/security';

// Impor komponen dari react-leaflet
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Tipe untuk data wilayah dari API
interface Region {
  id: string;
  name: string;
}

// Komponen kecil untuk memperbarui view peta secara dinamis
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15); // Pindahkan view peta dan set zoom ke 15
  }, [center, map]);
  return null;
};

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { reports, createReport, cancelReport } = useData();
  const [showForm, setShowForm] = useState(false);
  
  const [description, setDescription] = useState('');
  
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [districts, setDistricts] = useState<Region[]>([]);
  const [villages, setVillages] = useState<Region[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<{ id: string; name: string } | null>(null);
  const [selectedCity, setSelectedCity] = useState<{ id: string; name: string } | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<{ id: string; name: string } | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<{ id: string; name: string } | null>(null);
  
  const [isLoading, setIsLoading] = useState({
    provinces: false,
    cities: false,
    districts: false,
    villages: false,
  });

  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.9175, 107.6191]); // Default di Bandung
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    if (showForm && provinces.length === 0) {
      setIsLoading(prev => ({ ...prev, provinces: true }));
      fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
        .then(res => res.json())
        .then((data: Region[]) => setProvinces(data))
        .catch(error => console.error("Failed to fetch provinces:", error))
        .finally(() => setIsLoading(prev => ({ ...prev, provinces: false })));
    }
  }, [showForm, provinces.length]);

  useEffect(() => {
    if (selectedProvince) {
      setIsLoading(prev => ({ ...prev, cities: true }));
      setCities([]); setDistricts([]); setVillages([]);
      setSelectedCity(null); setSelectedDistrict(null); setSelectedVillage(null);
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvince.id}.json`)
        .then(res => res.json())
        .then((data: Region[]) => setCities(data))
        .catch(error => console.error("Failed to fetch cities:", error))
        .finally(() => setIsLoading(prev => ({ ...prev, cities: false })));
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedCity) {
      setIsLoading(prev => ({ ...prev, districts: true }));
      setDistricts([]); setVillages([]);
      setSelectedDistrict(null); setSelectedVillage(null);
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedCity.id}.json`)
        .then(res => res.json())
        .then((data: Region[]) => setDistricts(data))
        .catch(error => console.error("Failed to fetch districts:", error))
        .finally(() => setIsLoading(prev => ({ ...prev, districts: false })));
    }
  }, [selectedCity]);
  
  useEffect(() => {
    if (selectedDistrict) {
      setIsLoading(prev => ({ ...prev, villages: true }));
      setVillages([]);
      setSelectedVillage(null);
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedDistrict.id}.json`)
        .then(res => res.json())
        .then((data: Region[]) => setVillages(data))
        .catch(error => console.error("Failed to fetch villages:", error))
        .finally(() => setIsLoading(prev => ({ ...prev, villages: false })));
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (selectedVillage && selectedDistrict && selectedCity && selectedProvince) {
      setIsGeocoding(true);
      const addressString = `${selectedVillage.name}, ${selectedDistrict.name}, ${selectedCity.name}, ${selectedProvince.name}`;
      const query = encodeURIComponent(addressString);
      
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const { lat, lon } = data[0];
            setMapCenter([parseFloat(lat), parseFloat(lon)]);
          } else {
            console.warn("Geocoding failed for:", addressString);
          }
        })
        .catch(error => console.error("Geocoding API error:", error))
        .finally(() => setIsGeocoding(false));
    }
  }, [selectedVillage, selectedDistrict, selectedCity, selectedProvince]);

  const resetForm = () => {
    setDescription('');
    setSelectedProvince(null);
    setSelectedCity(null);
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setProvinces([]); setCities([]); setDistricts([]); setVillages([]);
    setMapCenter([-6.9175, 107.6191]);
    setShowForm(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !selectedVillage) {
      alert('Deskripsi dan semua field lokasi wajib diisi!');
      return;
    }
    const reportData = {
      description: sanitizeInput(description),
      location: {
        lat: mapCenter[0],
        lng: mapCenter[1],
        province: selectedProvince!.name,
        city: selectedCity!.name,
        district: selectedDistrict!.name,
        village: selectedVillage!.name,
        fullAddress: `${selectedVillage!.name}, ${selectedDistrict!.name}, ${selectedCity!.name}, ${selectedProvince!.name}`
      },
    };
    createReport(reportData);
    resetForm();
  };

  const userReports = user ? reports.filter(report => report.user_id === user.id) : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderDropdown = (label: string, value: {id: string, name: string} | null, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: Region[], isLoading: boolean, disabled: boolean) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value ? `${value.id}|${value.name}` : ''}
        onChange={onChange}
        disabled={disabled || isLoading}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100"
        required
      >
        <option value="" disabled>{isLoading ? 'Memuat...' : `Pilih ${label}`}</option>
        {options.map(option => (
          <option key={option.id} value={`${option.id}|${option.name}`}>{option.name}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
            <p className="text-gray-600 mt-2">Track your environmental reports and their status</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Report</span>
          </button>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full flex flex-col max-h-[90vh]">
              <div className="p-6 border-b flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Submit New Report</h2>
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                <div className="p-6 space-y-4 overflow-y-auto">
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea id="description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Jelaskan masalah sampah yang Anda temukan..." required />
                  </div>

                  {renderDropdown("Provinsi", selectedProvince, (e) => { const [id, name] = e.target.value.split('|'); setSelectedProvince({id, name}) }, provinces, isLoading.provinces, false)}
                  {renderDropdown("Kota/Kabupaten", selectedCity, (e) => { const [id, name] = e.target.value.split('|'); setSelectedCity({id, name}) }, cities, isLoading.cities, !selectedProvince)}
                  {renderDropdown("Kecamatan", selectedDistrict, (e) => { const [id, name] = e.target.value.split('|'); setSelectedDistrict({id, name}) }, districts, isLoading.districts, !selectedCity)}
                  {renderDropdown("Kelurahan/Desa", selectedVillage, (e) => { const [id, name] = e.target.value.split('|'); setSelectedVillage({id, name}) }, villages, isLoading.villages, !selectedDistrict)}

                  <div className="h-64 w-full rounded-lg overflow-hidden relative bg-gray-200 mt-2">
                    <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false} className="h-full w-full">
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={mapCenter} />
                      <MapUpdater center={mapCenter} />
                    </MapContainer>
                    {isGeocoding && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                        <span className="ml-2 text-gray-700">Mencari Lokasi...</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photo (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Photo upload coming soon</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t flex space-x-4 flex-shrink-0 bg-gray-50 rounded-b-xl">
                  <button type="button" onClick={resetForm} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="flex-1 bg-emerald-500 text-white px-4 py-3 rounded-lg hover:bg-emerald-600 flex items-center justify-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Submit Report</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid gap-6">
          {userReports.length > 0 ? (
            userReports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-lg font-medium text-gray-900 mb-2">{report.description}</p>
                    <div className="flex items-center text-sm text-gray-600 space-x-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{report.location.fullAddress}</span>
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
                {report.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        // Tambahkan pengecekan 'if (user)' di sini untuk memastikan user tidak null
                        if (user && window.confirm('Apakah Anda yakin ingin membatalkan laporan ini?')) {
                          cancelReport(report.id, user.id);
                        }
                      }}
                      className="text-sm font-medium text-red-600 hover:text-red-800"
                    >
                      Batalkan Laporan
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Reports Yet</h3>
              <p className="text-gray-600 mb-6">Start making a difference by reporting waste issues in your community.</p>
              <button onClick={() => setShowForm(true)} className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-600">
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