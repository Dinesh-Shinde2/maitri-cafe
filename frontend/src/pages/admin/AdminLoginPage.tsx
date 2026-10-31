import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    authApi
      .login({ username, password })
      .then((res) => {
        login(res.data.access_token, res.data.username, res.data.full_name);
        setLoading(false);
        navigate('/admin/dashboard');
      })
      .catch(() => {
        setErrorMsg('Invalid credentials');
        setLoading(false);
      });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <form onSubmit={handleLogin} className="w-full max-w-sm border border-paper-line bg-paper-card p-8 shadow-soft space-y-5">
        <div>
          <p className="font-display text-2xl font-bold text-ink">Maitri</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-mute">Staff sign in</p>
        </div>

        {errorMsg && (
          <div className="border border-copper/40 bg-copper/10 px-3 py-2 text-xs text-ink-soft">{errorMsg}</div>
        )}

        <label className="block text-xs font-medium text-ink-mute">
          Username
          <div className="relative mt-1">
            <User className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-mute" />
            <input
              className="field pl-10"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </label>

        <label className="block text-xs font-medium text-ink-mute">
          Password
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-mute" />
            <input
              className="field pl-10"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </label>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
};
