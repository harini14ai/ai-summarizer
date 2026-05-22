// ============================================
// Stats Page - Personal Usage Statistics
// ============================================

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, FileText, Zap, TrendingUp, Bookmark, Clock } from 'lucide-react';
import { useSummaryStore } from '../store/summaryStore';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';

// ============================================
// Stat Card Component
// ============================================
const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700"
  >
    <div className={`inline-flex p-3 rounded-xl mb-4 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
  </motion.div>
);

// ============================================
// Model Usage Bar
// ============================================
const ModelBar = ({ model, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{model}</span>
        <span className="text-gray-500 dark:text-gray-400">{count} ({pct}%)</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
};

// ============================================
// Stats Page
// ============================================
export const StatsPage = () => {
  const { summaries, getSummaries } = useSummaryStore();
  const { user } = useAuthStore();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSummaries({ page: 1, limit: 100 }).then(() => setLoaded(true));
  }, []);

  // Compute stats from loaded summaries
  const totalSummaries = summaries.length;
  const bookmarked = summaries.filter((s) => s.isBookmarked).length;
  const totalWords = summaries.reduce((acc, s) => acc + (s.wordCount || 0), 0);
  const avgWords = totalSummaries > 0 ? Math.round(totalWords / totalSummaries) : 0;

  // Model breakdown
  const modelCounts = summaries.reduce((acc, s) => {
    acc[s.aiModel] = (acc[s.aiModel] || 0) + 1;
    return acc;
  }, {});

  // Content type breakdown
  const typeCounts = summaries.reduce((acc, s) => {
    acc[s.contentType] = (acc[s.contentType] || 0) + 1;
    return acc;
  }, {});

  // Recent activity (last 5)
  const recent = [...summaries]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const MODEL_COLORS = {
    openai: 'bg-green-500',
    gemini: 'bg-blue-500',
    claude: 'bg-orange-500',
  };

  const TYPE_ICONS = {
    text: '📝',
    pdf: '📄',
    docx: '📃',
    txt: '🗒️',
    url: '🔗',
  };

  const usagePct = user
    ? Math.min(100, Math.round((user.apiUsageCount / user.apiUsageLimit) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 lg:ml-64">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Your Stats
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of your summarization activity
          </p>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={FileText}
            label="Total Summaries"
            value={totalSummaries}
            color="bg-blue-500"
            delay={0}
          />
          <StatCard
            icon={Bookmark}
            label="Bookmarked"
            value={bookmarked}
            color="bg-yellow-500"
            delay={0.1}
          />
          <StatCard
            icon={TrendingUp}
            label="Avg. Word Count"
            value={avgWords.toLocaleString()}
            color="bg-purple-500"
            delay={0.2}
          />
          <StatCard
            icon={Zap}
            label="API Calls Used"
            value={user?.apiUsageCount ?? 0}
            color="bg-green-500"
            delay={0.3}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* API Usage Quota */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap size={20} className="text-yellow-500" />
              API Usage Quota
            </h2>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                {user?.apiUsageCount ?? 0} / {user?.apiUsageLimit ?? 10} calls
              </span>
              <span
                className={`font-semibold ${
                  usagePct >= 90
                    ? 'text-red-500'
                    : usagePct >= 70
                    ? 'text-yellow-500'
                    : 'text-green-500'
                }`}
              >
                {usagePct}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  usagePct >= 90
                    ? 'bg-red-500'
                    : usagePct >= 70
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Plan: <span className="font-medium capitalize">{user?.subscriptionPlan ?? 'free'}</span>
            </p>
          </motion.div>

          {/* AI Model Usage */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 size={20} className="text-blue-500" />
              AI Model Usage
            </h2>
            {totalSummaries === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No data yet</p>
            ) : (
              Object.entries(modelCounts).map(([model, count]) => (
                <ModelBar
                  key={model}
                  model={model}
                  count={count}
                  total={totalSummaries}
                  color={MODEL_COLORS[model] || 'bg-gray-500'}
                />
              ))
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Type Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Content Types
            </h2>
            {Object.keys(typeCounts).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No data yet</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(typeCounts).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span>{TYPE_ICONS[type] || '📄'}</span>
                      <span className="capitalize">{type}</span>
                    </span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock size={20} className="text-purple-500" />
              Recent Activity
            </h2>
            {recent.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {recent.map((s) => (
                  <div key={s._id} className="flex items-start gap-3">
                    <span className="text-lg">{TYPE_ICONS[s.contentType] || '📄'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                        {s.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(s.createdAt), 'MMM dd, yyyy')} · {s.aiModel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
