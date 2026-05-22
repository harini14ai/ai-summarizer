// ============================================
// Header/Navigation Component
// ============================================

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    // Initialise from localStorage, falling back to system preference
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Apply theme class on mount and whenever isDark changes
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
          >
            ✨ Summarizer
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/dashboard"
            className={`${
              isActive('/dashboard')
                ? 'text-blue-600 dark:text-blue-400'
                : 'hover:text-gray-700'
            }`}
          >
            Dashboard
          </Link>
          <Link
            to="/history"
            className={`${
              isActive('/history')
                ? 'text-blue-600 dark:text-blue-400'
                : 'hover:text-gray-700'
            }`}
          >
            History
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Menu */}
          <div className="relative group hidden md:block">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              {user.firstName || 'Profile'}
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <Link
                to="/settings"
                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
              >
                <Settings className="inline mr-2" size={16} /> Settings
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
              >
                <LogOut className="inline mr-2" size={16} /> Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-gray-50 dark:bg-gray-800 px-4 py-4 space-y-2"
        >
          <Link
            to="/dashboard"
            className="block py-2 hover:text-blue-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            to="/history"
            className="block py-2 hover:text-blue-600"
            onClick={() => setIsMenuOpen(false)}
          >
            History
          </Link>
          <Link
            to="/settings"
            className="block py-2 hover:text-blue-600"
            onClick={() => setIsMenuOpen(false)}
          >
            Settings
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setIsMenuOpen(false);
            }}
            className="w-full text-left py-2 text-red-600 hover:text-red-700"
          >
            Logout
          </button>
        </motion.div>
      )}
    </header>
  );
};
