// ============================================
// History Page - View Previous Summaries
// ============================================

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Bookmark, Search, X, Copy, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSummaryStore } from '../store/summaryStore';
import { LoadingSkeleton } from '../components/Loading';
import { ToastContainer, toast } from 'react-toastify';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

// ============================================
// Summary Detail Modal
// ============================================
const SummaryModal = ({ summary, onClose }) => {
  if (!summary) return null;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied to clipboard!'));
  };

  const handleDownload = () => {
    const content = [
      `# ${summary.title}`,
      `Date: ${format(new Date(summary.createdAt), 'PPP')}`,
      `Model: ${summary.aiModel}`,
      `Type: ${summary.contentType}`,
      '',
      summary.summaries?.short ? `## Short Summary\n${summary.summaries.short}` : '',
      summary.summaries?.detailed ? `\n## Detailed Summary\n${summary.summaries.detailed}` : '',
      summary.summaries?.bulletPoints?.length
        ? `\n## Bullet Points\n${summary.summaries.bulletPoints.map((p) => `- ${p}`).join('\n')}`
        : '',
      summary.analysis?.keywords?.length
        ? `\n## Keywords\n${summary.analysis.keywords.join(', ')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.title.replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
              {summary.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {format(new Date(summary.createdAt), 'PPP')} · {summary.aiModel} · {summary.contentType}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"
              title="Download as Markdown"
            >
              <Download size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-300"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Short Summary */}
          {summary.summaries?.short && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-blue-700 dark:text-blue-300">Short Summary</h3>
                <button
                  onClick={() => handleCopy(summary.summaries.short)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <Copy size={14} />
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                {summary.summaries.short}
              </p>
            </div>
          )}

          {/* Detailed Summary */}
          {summary.summaries?.detailed && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-purple-700 dark:text-purple-300">Detailed Summary</h3>
                <button
                  onClick={() => handleCopy(summary.summaries.detailed)}
                  className="text-purple-500 hover:text-purple-700"
                >
                  <Copy size={14} />
                </button>
              </div>
              <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed prose-summary">
                <ReactMarkdown>{summary.summaries.detailed}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Bullet Points */}
          {summary.summaries?.bulletPoints?.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">Bullet Points</h3>
              <ul className="space-y-1">
                {summary.summaries.bulletPoints.map((point, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Analysis */}
          {(summary.analysis?.keywords?.length > 0 || summary.analysis?.sentiment) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.analysis?.keywords?.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {summary.analysis.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {summary.analysis?.sentiment && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">Sentiment</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      summary.analysis.sentiment === 'positive'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : summary.analysis.sentiment === 'negative'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {summary.analysis.sentiment}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// History Page
// ============================================
export const HistoryPage = () => {
  const { summaries, getSummaries, deleteSummary, loading, toggleBookmark } = useSummaryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSummary, setSelectedSummary] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getSummaries({ page, limit: 9, search: searchTerm });
      if (result?.pagination) {
        setTotalPages(result.pagination.pages);
      }
    };
    fetchData();
  }, [page, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this summary?')) {
      try {
        await deleteSummary(id);
        toast.success('Summary deleted');
        // Close modal if the deleted summary was open
        if (selectedSummary?._id === id) setSelectedSummary(null);
      } catch {
        toast.error('Failed to delete summary');
      }
    }
  };

  const handleToggleBookmark = async (id) => {
    try {
      await toggleBookmark(id);
      toast.success('Bookmark updated');
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const MODEL_COLORS = {
    openai: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    gemini: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    claude: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <ToastContainer />

      {/* Summary Detail Modal */}
      <AnimatePresence>
        {selectedSummary && (
          <SummaryModal
            summary={selectedSummary}
            onClose={() => setSelectedSummary(null)}
          />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 lg:ml-64">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">History</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Browse and manage your previous summaries
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search summaries..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </motion.div>

        {/* Summaries Grid */}
        {loading ? (
          <LoadingSkeleton count={6} />
        ) : summaries.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              No summaries found
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              Create your first summary from the Dashboard
            </p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {summaries.map((summary, index) => (
                <motion.div
                  key={summary._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg p-5 transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold flex-1 line-clamp-2 text-gray-900 dark:text-white pr-2">
                      {summary.title}
                    </h3>
                    <button
                      onClick={() => handleToggleBookmark(summary._id)}
                      className="ml-1 flex-shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      title={summary.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                      <Bookmark
                        size={18}
                        fill={summary.isBookmarked ? 'currentColor' : 'none'}
                        className={summary.isBookmarked ? 'text-yellow-500' : 'text-gray-400'}
                      />
                    </button>
                  </div>

                  {/* Preview */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 flex-1">
                    {summary.summaries?.short || summary.originalContent?.slice(0, 120) + '...'}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${MODEL_COLORS[summary.aiModel] || 'bg-gray-100 text-gray-600'}`}>
                      {summary.aiModel}
                    </span>
                    <span>{format(new Date(summary.createdAt), 'MMM dd, yyyy')}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedSummary(summary)}
                      className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 text-sm font-medium transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(summary._id)}
                      className="px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
