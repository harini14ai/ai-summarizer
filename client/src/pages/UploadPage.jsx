// ============================================
// Upload Page - File Upload Interface
// ============================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, Loader } from 'lucide-react';
import { useSummaryStore } from '../store/summaryStore';
import { ModelSelector } from '../components/ModelSelector';
import { toast } from 'react-toastify';

export const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [summaryTypes, setSummaryTypes] = useState(['short', 'detailed']);
  const { uploadFile, loading, selectedModel } = useSummaryStore();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Only PDF, DOCX, and TXT files are allowed');
        return;
      }

      setFile(selectedFile);
      setTitle(selectedFile.name.replace(/\.[^.]*$/, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!title.trim()) {
      toast.error('Please provide a title');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('aiModel', selectedModel);
    formData.append('summaryTypes', JSON.stringify(summaryTypes));

    try {
      await uploadFile(formData);
      toast.success('File processed successfully!');
      setFile(null);
      setTitle('');
    } catch (error) {
      toast.error(error.message || 'Failed to upload file');
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
          <h1 className="text-4xl font-bold mb-2">Upload & Summarize</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Upload PDF, DOCX, or TXT files to summarize
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Model Selection */}
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
              placeholder="Summary title..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800"
            />
          </div>

          {/* File Upload Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('bg-blue-50');
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove('bg-blue-50');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('bg-blue-50');
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile) {
                const changeEvent = { target: { files: [droppedFile] } };
                handleFileChange(changeEvent);
              }
            }}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
          >
            <Upload size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">Drop your file here</p>
            <p className="text-gray-600 mb-4">or click to select</p>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
              accept=".pdf,.docx,.txt"
            />
            <label
              htmlFor="file-input"
              className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
            >
              Select File
            </label>
          </div>

          {/* Selected File Info */}
          {file && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-3">
              <File size={24} className="text-blue-500" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          )}

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
            disabled={loading || !file}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Processing File...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload & Summarize
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
};
