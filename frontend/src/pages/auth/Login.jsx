import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/authApi';
import { getErrorMessage } from '../../utils/formatters';
import toast from 'react-hot-toast';

/**
 * Login page - entry point for all users
 */
const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', role: 'salesperson' });

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      const userData = res.data.data;
      login(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      navigate(userData.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.register(registerForm);
      const userData = res.data.data;
      login(userData);
      toast.success(`Account created! Welcome, ${userData.name}!`);
      navigate(userData.role === 'admin' ? '/admin/dashboard' : '/sales/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Hero Cycles</h1>
          <p className="text-slate-400 text-sm">Pricing Engine</p>
        </div>

        <div className="card p-6">
          {/* Toggle tabs */}
          <div className="flex bg-slate-800 rounded-lg p-1 mb-6">
            <button
              onClick={() => setShowRegister(false)}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                !showRegister ? 'bg-primary-600 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setShowRegister(true)}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                showRegister ? 'bg-primary-600 text-white font-medium' : 'text-slate-400'
              }`}
            >
              Register
            </button>
          </div>

          {!showRegister ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="label" htmlFor="regName">Full Name</label>
                <input
                  id="regName"
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="input"
                  placeholder="Your Name"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="regEmail">Email</label>
                <input
                  id="regEmail"
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="input"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="regPassword">Password</label>
                <input
                  id="regPassword"
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="input"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="label" htmlFor="regRole">Role</label>
                <select
                  id="regRole"
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                  className="select"
                >
                  <option value="salesperson">Salesperson</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          Hero Cycles Pricing Engine © 2026
        </p>
      </div>
    </div>
  );
};

export default Login;
