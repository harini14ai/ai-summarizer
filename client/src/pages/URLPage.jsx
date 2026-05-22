// ============================================
// URL Summarizer Page
// ============================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Loader } from 'lucide-react';
import { useSummaryStore } from '../store/summaryStore';
import { ModelSelector } from '../components/ModelSelector';
import { toast } from 'react-toastify';

export const URLPage = () => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [summaryTypes, setSummaryTypes] = useState(['short', 'detailed']);
  const { processURL, loading, selectedModel } = useSummaryStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      toast.error('Please provide a URL');
      return;
    }

    try {
      // Basic URL validation
      new URL(url);
    } catch {
      toast.error('Please provide a valid URL');
      return;
    }

    if (!title.trim()) {
      toast.error('Please provide a title');
      return;
    }

    try {
      await processURL({
        url,
        title: title.trim() || undefined,
        aiModel: selectedModel,
        summaryTypes,
      });
      toast.success('URL processed successfully!');
      setUrl('');
      setTitle('');
    } catch (error) {
      toast.error(error.message || 'Failed to process URL');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-2xl mx-auto px-4 lg:ml-64">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Summarize URL</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Paste any article or webpage URL to get an instant summary
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Model Selection */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Select AI Model</h2>
            <ModelSelector />
          </div>

          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Webpage URL</label>
            <div className="relative">
              <Link2 className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
              />
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give this summary a title..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            />
          </div>

          {/* Summary Types */}
          <div>
            <label className="block text-sm font-medium mb-3">Summary Types</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'short', label: '🎯 Short' },
                { id: 'detailed', label: '📖 Detailed' },
                { id: 'bulletPoints', label: '• Bullet Points' },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() =>
                    setSummaryTypes((prev) =>
                      prev.includes(type.id)
                        ? prev.filter((t) => t !== type.id)
                        : [...prev, type.id]
                    )
                  }
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    summaryTypes.includes(type.id)
                      ? 'border-blue-500 bg-blue-100 dark:bg-blue-900'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Processing URL...
              </>
            ) : (
              <>
                <Link2 size={20} />
                Summarize URL
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};
