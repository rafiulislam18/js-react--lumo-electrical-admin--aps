import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Zap, Lock, User } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) navigate('/');
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/users/admin/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-cyan-400/5 blur-3xl" />

      {/* Subtle grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/40 shadow-2xl backdrop-blur-xl">
          {/* Top accent line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          {/* Header */}
          <div className="relative px-8 pt-10 pb-8 text-center">
            {/* Logo area */}
            <div className="mb-5 inline-flex items-center justify-center rounded-2xl p-4">
              <img src="/images/logo-light.png" alt="Lumo Electrical" className="h-16" />
            </div>

            {/* Badge */}
            {/* <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              <Zap size={11} />
              <span>Admin Portal</span>
            </div> */}

            <h1 className="mb-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Admin Dashboard
            </h1>
            <p className="mt-1.5 text-sm font-medium text-slate-400">
              Lumo Electrical Management System
            </p>
          </div>

          {/* Divider */}
          <div className="mx-8 h-px bg-slate-700/60" />

          {/* Form */}
          <form onSubmit={handleLogin} className="px-8 py-8 space-y-5">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-400/30 bg-red-500/10 p-3.5">
                <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300 font-medium">{error}</p>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-xs font-semibold text-slate-300">
                Username
              </label>
              <div className="relative">
                <User size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/60 focus:outline-none transition-all hover:border-slate-600"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 bg-slate-900/60 border border-slate-700/60 text-white placeholder-slate-500 rounded-xl text-sm focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-400/60 focus:outline-none transition-all hover:border-slate-600"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-slate-700/60 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="w-full flex items-center justify-center gap-2 py-3 mt-2 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 py-4 border-t border-slate-700/60 bg-slate-800/30 text-center">
            <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500">
              🔒 Secure Admin Access &nbsp;·&nbsp; Authorized Users Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
