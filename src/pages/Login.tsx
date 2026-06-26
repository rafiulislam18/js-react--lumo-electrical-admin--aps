import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Lock, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('role');
    if (token && role === 'admin') navigate('/');
    else if (token && role === 'delivery_personnel') navigate('/courier/dashboard');
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
      localStorage.setItem('role', data.role);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.role === 'delivery_personnel') {
        navigate('/courier/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-bg">
      {/* Card */}
      <div className="w-full max-w-[380px] animate-pop">
        <div className="bg-panel border border-line rounded-card overflow-hidden">
          {/* Header */}
          <div className="px-7 pt-9 pb-7 text-center border-b border-line">
            <img src={`${import.meta.env.BASE_URL}images/${theme === 'dark' ? 'logo-light.png' : 'logo.png'}`} alt="Lumo Electrical" className="h-14 mx-auto mb-5" />

            <div className="flex items-center justify-center gap-2">
              <span className="w-[7px] h-[7px] rounded-full bg-pos shadow-[0_0_8px_#5fcf80]" />
              <span className="font-mono text-[11px] font-semibold tracking-[.18em] uppercase text-body">
                Admin Console
              </span>
            </div>
            <p className="mt-2 font-mono text-[11px] text-mute tracking-[.04em]">
              // lumo electrical management
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="px-7 py-7 space-y-5">
            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-[7px] border border-neg/30 bg-neg/10 p-3">
                <AlertCircle size={14} className="text-neg flex-shrink-0 mt-0.5" />
                <p className="text-xs text-neg">{error}</p>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label htmlFor="username" className="block font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">
                Username
              </label>
              <div className="relative">
                <User size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-panel2 border border-line rounded-[7px] pl-9 pr-3 py-2.5 text-[12.5px] text-body outline-none focus:border-accent/50 placeholder:text-mute disabled:opacity-50"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block font-mono text-[10.5px] tracking-[.12em] uppercase text-mute">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-panel2 border border-line rounded-[7px] pl-9 pr-10 py-2.5 text-[12.5px] text-body outline-none focus:border-accent/50 placeholder:text-mute disabled:opacity-50"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-mute hover:text-body transition-colors"
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
              className="w-full inline-flex items-center justify-center gap-[7px] py-2.5 mt-2 text-[12.5px] font-bold rounded-[7px] bg-accent text-accent-ink border border-accent hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 rounded-full border-2 border-accent-ink border-t-transparent animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-7 py-3.5 border-t border-line bg-bg2 text-center">
            <p className="font-mono text-[10px] uppercase tracking-[.12em] text-mute">
              Secure access // authorized users only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
