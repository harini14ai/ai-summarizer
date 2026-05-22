// ============================================
// Model Selector Component
// ============================================

import { motion } from 'framer-motion';
import { useSummaryStore } from '../store/summaryStore';

export const ModelSelector = () => {
  const { selectedModel, setSelectedModel } = useSummaryStore();

  const models = [
    {
      id: 'gemini',
      name: 'Gemini 2.5',
      icon: '✨',
      description: 'Fast & free tier',
      badge: 'FREE',
      badgeColor: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    },
    {
      id: 'openai',
      name: 'GPT-4o Mini',
      icon: '🤖',
      description: 'Advanced reasoning',
      badge: 'PAID',
      badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    },
    {
      id: 'claude',
      name: 'Claude 3.5',
      icon: '🧠',
      description: 'Creative & detailed',
      badge: 'PAID',
      badgeColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
      {models.map((model) => (
        <motion.button
          key={model.id}
          onClick={() => setSelectedModel(model.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            selectedModel === model.id
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <span className="text-2xl">{model.icon}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${model.badgeColor}`}>
              {model.badge}
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{model.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{model.description}</p>
          {selectedModel === model.id && (
            <div className="mt-2 flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Selected</span>
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
};
