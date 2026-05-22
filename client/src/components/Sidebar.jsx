// ============================================
// Sidebar Navigation Component
// ============================================

import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  History,
  Settings,
  BarChart3,
  Upload,
  Link2,
} from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: FileText, label: 'Create', path: '/dashboard' },
    { icon: Upload, label: 'Upload', path: '/upload' },
    { icon: Link2, label: 'URL', path: '/url' },
    { icon: History, label: 'History', path: '/history' },
    { icon: BarChart3, label: 'Stats', path: '/stats' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="hidden lg:fixed lg:left-0 lg:top-16 lg:w-64 lg:h-screen lg:bg-white dark:lg:bg-gray-900 lg:border-r lg:border-gray-200 dark:lg:border-gray-800 lg:flex lg:flex-col lg:p-6 lg:space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link key={item.path} to={item.path}>
            <motion.div
              whileHover={{ x: 4 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </motion.div>
          </Link>
        );
      })}
    </aside>
  );
};
