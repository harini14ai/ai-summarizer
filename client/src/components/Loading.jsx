// ============================================
// Loading Skeleton Component
// ============================================

import { motion } from 'framer-motion';

export const LoadingSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="bg-gray-200 dark:bg-gray-700 h-32 rounded-lg"
        />
      ))}
    </div>
  );
};

export const SkeletonText = ({ lines = 3 }) => {
  return (
    <div className="space-y-3">
      {[...Array(lines)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="bg-gray-200 dark:bg-gray-700 h-4 rounded w-full"
          style={{ width: `${80 + Math.random() * 20}%` }}
        />
      ))}
    </div>
  );
};
