// ============================================
// Login Page
// ============================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

export const LoginPage = () => {
  const [formData, setFormData]   = useState({ email: '', password: '' });
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const { login, loading }        = useAuthStore();
  const navigate                  = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDebugInfo(null);

    // Basic client-side validation
    if (!formData.email.trim()) { toast.error('Email is required'); return; }
    if (!formData.password)     { toast.error('Password is required'); return; }

    try {
      await login(formData);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      // Collect full debug info
      const info = {
        userMessage:  error.userMessage,
        httpStatus:   error.response?.status,
        serverMsg:    error.response?.data?.message,
        serverData:   error.response?.data,
        networkError: !error.response ? error.message : null,
        requestURL:   error.config?.baseURL + error.config?.url,
        timestamp:    new Date().toISOString(),
      };
      setDebugInfo(info);

      // Show the most useful message in the toast
      const toastMsg =
        info.networkError
          ? `Cannot reach server: ${info.networkError}`
          : info.userMessage || info.serverMsg || 'Login failed';

      toast.error(toastMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">✨</div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Sign in to your AI Summarizer account
          </p>
        </div>

        {/* Error Debug Panel */}
        {debugInfo && (
          <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 overflow-hidden">
            <button
              onClick={() => setShowDebug((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium"
            >
              <span className="flex items-center gap-2">
                <AlertCircle size={16} />
                {debugInfo.networkError
                  ? 'Cannot connect to server'
                  : `Login failed${debugInfo.httpStatus ? ` (HTTP ${debugInfo.httpStatus})` : ''}: ${debugInfo.serverMsg || debugInfo.userMessage}`}
              </span>
              {showDebug ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showDebug && (
              <div className="px-4 py-3 bg-red-50/50 dark:bg-red-900/10 text-xs font-mono text-red-800 dark:text-red-200 space-y-1 border-t border-red-200 dark:border-red-800">
                <p><span className="font-bold">URL:</span> {debugInfo.requestURL}</p>
                <p><span className="font-bold">Status:</span> {debugInfo.httpStatus ?? 'No response'}</p>
                <p><span className="font-bold">Message:</span> {debugInfo.serverMsg ?? debugInfo.networkError ?? '—'}</p>
                {debugInfo.networkError && (
                  <p className="text-yellow-700 dark:text-yellow-300 mt-2">
                    ⚠ Network error — backend may be down, wrong URL, or CORS blocked.
                    Check VITE_API_URL in your environment variables.
                  </p>
                )}
                {debugInfo.httpStatus === 404 && (
                  <p className="text-yellow-700 dark:text-yellow-300 mt-2">
                    ⚠ Route not found — check VITE_API_URL points to the correct backend.
                  </p>
                )}
                {debugInfo.httpStatus === 401 && (
                  <p className="text-yellow-700 dark:text-yellow-300 mt-2">
                    ⚠ Wrong email or password.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-500 hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
