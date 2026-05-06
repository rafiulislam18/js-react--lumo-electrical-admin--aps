import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/users/admin/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      // Store tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"></div>

      {/* Decorative animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top right blue orb */}
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full opacity-20 -top-48 -right-48 blur-3xl animate-pulse"></div>
        {/* Bottom left indigo orb */}
        <div className="absolute w-80 h-80 bg-indigo-500 rounded-full opacity-15 -bottom-40 -left-40 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        {/* Center cyan accent */}
        <div className="absolute w-72 h-72 bg-cyan-400 rounded-full opacity-10 top-1/3 right-1/3 blur-3xl"></div>

        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] opacity-50"></div>

        {/* Floating shapes for depth */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full opacity-60"></div>
        <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-cyan-300 rounded-full opacity-50"></div>
        <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-40"></div>
        <div className="absolute top-1/2 right-20 w-1 h-1 bg-blue-300 rounded-full opacity-70"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="bg-slate-800/40 rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden backdrop-blur-xl">
          {/* Header with gradient */}
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-16 text-center overflow-hidden">
            {/* Accent elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center h-20 mb-6 p-2">
                <img src="/images/logo-light.png" alt="Lumo Electrical" className="h-16" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">Admin Dashboard</h1>
              <p className="text-blue-100 font-medium">Lumo Electrical Management System</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="px-8 py-10 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/15 border border-red-400/30 rounded-xl shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300 font-medium">{error}</p>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2.5">
              <label htmlFor="username" className="block text-sm font-semibold text-slate-200">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600/60 text-white placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/40 focus:outline-none transition-all duration-200 shadow-sm hover:bg-slate-800/80 hover:border-slate-500/60"
                disabled={loading}
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2.5">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-200">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600/60 text-white placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400/40 focus:outline-none transition-all duration-200 shadow-sm hover:bg-slate-800/80 hover:border-slate-500/60"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors p-1 hover:bg-slate-700/60 rounded-lg"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl mt-8"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-5 bg-slate-800/60 border-t border-slate-700/60 text-center">
            <p className="text-xs font-medium text-slate-400 tracking-wide">
              🔒 Secure Admin Access • Authorized Users Only
            </p>
          </div>
        </div>

        {/* Optional: Subtle tip below card */}
        {/* <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Protected by JWT Authentication</p>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
