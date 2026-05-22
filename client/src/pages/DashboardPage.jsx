// ============================================
// Dashboard Page - Main Content Creator
// ============================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, FileText, Loader, Copy, Download, Zap } from 'lucide-react';
import { ModelSelector } from '../components/ModelSelector';
import { useSummaryStore } from '../store/summaryStore';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';

export const DashboardPage = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [summaryTypes, setSummaryTypes] = useState(['short', 'detailed', 'bulletPoints']);
  
  const { createTextSummary, loading, currentSummary, selectedModel } = useSummaryStore();
  const { user } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() || !title.trim()) {
      toast.error('Please provide both title and content');
      return;
    }

    if (content.length < 50) {
      toast.error('Content should be at least 50 characters');
      return;
    }

    try {
      await createTextSummary({
        content,
        title,
        aiModel: selectedModel,
        summaryTypes,
      });
      toast.success('Summary created successfully!');
      setContent('');
      setTitle('');
    } catch (error) {
      toast.error(error.message || 'Failed to create summary');
    }
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard!'));
  };

  const handleDownload = () => {
    if (!currentSummary) return;
    const text = [
      `# ${currentSummary.title}`,
      currentSummary.summaries?.short ? `\n## Short Summary\n${currentSummary.summaries.short}` : '',
      currentSummary.summaries?.detailed ? `\n## Detailed Summary\n${currentSummary.summaries.detailed}` : '',
      currentSummary.summaries?.bulletPoints?.length
        ? `\n## Bullet Points\n${currentSummary.summaries.bulletPoints.map((p) => `- ${p}`).join('\n')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSummary.title.replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:ml-64">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {user?.firstName || 'User'}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Create powerful summaries with advanced AI models
          </p>
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Model Selector */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Select AI Model</h2>
                <ModelSelector />
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your summary a title..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Content Textarea */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Content to Summarize
                  <span className="ml-2 text-gray-400 font-normal">
                    {wordCount} words · {charCount} chars
                  </span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your text here or upload a document..."
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white font-mono text-sm"
                />
              </div>

              {/* Summary Types Selector */}
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
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Create Summary
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Right Panel - Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="sticky top-20 space-y-4">
              {currentSummary ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <FileText size={20} />
                      Summary Result
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(
                          [currentSummary.summaries?.short, currentSummary.summaries?.detailed]
                            .filter(Boolean).join('\n\n')
                        )}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"
                        title="Copy all"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={handleDownload}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    {summaryTypes.includes('short') && currentSummary.summaries?.short && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                            Short Summary
                          </h4>
                          <button onClick={() => handleCopy(currentSummary.summaries.short)}>
                            <Copy size={12} className="text-blue-400" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {currentSummary.summaries.short}
                        </p>
                      </div>
                    )}

                    {summaryTypes.includes('detailed') && currentSummary.summaries?.detailed && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                            Detailed Summary
                          </h4>
                          <button onClick={() => handleCopy(currentSummary.summaries.detailed)}>
                            <Copy size={12} className="text-purple-400" />
                          </button>
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed prose-summary">
                          <ReactMarkdown>{currentSummary.summaries.detailed}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {summaryTypes.includes('bulletPoints') && currentSummary.summaries?.bulletPoints?.length > 0 && (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <h4 className="font-medium text-xs text-green-600 dark:text-green-400 uppercase tracking-wide mb-2">
                          Bullet Points
                        </h4>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                          {currentSummary.summaries.bulletPoints.map((point, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-green-500 mt-0.5">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Analysis Tags */}
                    {currentSummary.analysis?.keywords?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-xs text-gray-500 uppercase tracking-wide mb-2">
                          Keywords
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {currentSummary.analysis.keywords.slice(0, 8).map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sentiment */}
                    {currentSummary.analysis?.sentiment && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">Sentiment:</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            currentSummary.analysis.sentiment === 'positive'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : currentSummary.analysis.sentiment === 'negative'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {currentSummary.analysis.sentiment}
                        </span>
                      </div>
                    )}

                    {/* Token usage */}
                    {currentSummary.tokensUsed?.total && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                        <Zap size={12} />
                        <span>{currentSummary.tokensUsed.total.toLocaleString()} tokens used</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg text-center text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 opacity-20" />
                  <p className="font-medium">Your summary will appear here</p>
                  <p className="text-sm mt-1 opacity-70">Paste text and click Create Summary</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
