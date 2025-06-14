import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Leaf, Mail, Lock, AlertCircle, RefreshCw } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 1. State baru untuk captcha
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState(0);
  const [userCaptchaInput, setUserCaptchaInput] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // 2. Fungsi untuk menghasilkan pertanyaan captcha baru
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1; // Angka acak 1-10
    const num2 = Math.floor(Math.random() * 10) + 1; // Angka acak 1-10
    setCaptchaQuestion(`${num1} + ${num2} = ?`);
    setCaptchaAnswer(num1 + num2);
  };

  // 3. useEffect untuk memanggil captcha saat halaman pertama kali dimuat
  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 4. Tambahkan validasi captcha sebelum login
    if (parseInt(userCaptchaInput, 10) !== captchaAnswer) {
      setError('Jawaban captcha salah. Silakan coba lagi.');
      generateCaptcha(); // Buat pertanyaan baru
      setUserCaptchaInput(''); // Kosongkan input
      return; // Hentikan proses login
    }

    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('Email atau password salah. Silakan coba lagi.');
        generateCaptcha(); // Buat pertanyaan baru jika login gagal
        setUserCaptchaInput('');
      }
    } catch (err) {
      setError('Login gagal. Silakan coba lagi nanti.');
      generateCaptcha();
      setUserCaptchaInput('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-emerald-500 p-3 rounded-full">
              <Leaf className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your EcoGuard account</p>
        </div>

        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* 5. Tampilkan captcha di dalam form */}
            <div>
              <label htmlFor="captcha" className="block text-sm font-medium text-gray-700 mb-2">Security Check</label>
              <div className="flex items-center space-x-4">
                <div className="bg-gray-200 text-gray-800 font-mono text-lg tracking-widest px-4 py-3 rounded-lg">
                  {captchaQuestion}
                </div>
                <input 
                  id="captcha" 
                  name="captcha" 
                  type="number" 
                  required 
                  value={userCaptchaInput} 
                  onChange={(e) => setUserCaptchaInput(e.target.value)} 
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
                  placeholder="Jawaban" 
                />
                <button type="button" onClick={generateCaptcha} title="Refresh Captcha" className="p-3 text-gray-500 hover:text-emerald-600">
                  <RefreshCw className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-emerald-500 hover:text-emerald-600 font-medium transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Demo credentials: admin@ecoguard.com / Admin123!</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;