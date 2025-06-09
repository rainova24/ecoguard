import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Leaf, Menu, X, LogOut, Shield, Map, Trophy, BarChart3 } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  // ---- LOGIKA BARU UNTUK NAVIGASI BERDASARKAN PERAN ----
  const navLinks = [
    { path: '/', label: 'Home', icon: Leaf, show: 'always' },
    { path: '/map', label: 'Map', icon: Map, show: 'always' },
  ];

  if (user) {
    if (user.role === 'admin') {
      // Menu untuk Admin
      navLinks.push({ path: '/admin', label: 'Admin', icon: Shield, show: 'loggedIn' });
    } else {
      // Menu untuk Pengguna Biasa
      navLinks.push({ path: '/dashboard', label: 'Dashboard', icon: BarChart3, show: 'loggedIn' });
      navLinks.push({ path: '/reports', label: 'My Reports', icon: Shield, show: 'loggedIn' });
      navLinks.push({ path: '/rewards', label: 'Rewards', icon: Trophy, show: 'loggedIn' });
    }
  }
  // ---------------------------------------------------

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-emerald-500 p-2 rounded-lg group-hover:bg-emerald-600 transition-colors">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EcoGuard</span>
          </Link>

          {/* Navigasi Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(path)
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Menu Pengguna */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-700">Welcome, {user.username}</span>
                  {/* ---- LOGIKA BARU: SEMBUNYIKAN POIN UNTUK ADMIN ---- */}
                  {user.role !== 'admin' && (
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium">
                      {user.points} pts
                    </span>
                  )}
                  {/* ------------------------------------------------- */}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-emerald-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          {/* ... sisa kode untuk mobile menu tidak berubah signifikan, bisa disesuaikan dengan pola yang sama */}
        </div>
      </div>
    </header>
  );
};

export default Header;