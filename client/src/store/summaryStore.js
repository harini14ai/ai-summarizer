// ============================================
// Summary Store (Zustand)
// ============================================
// Global state management for summaries

import { create } from 'zustand';
import { summaryAPI, fileAPI } from '../services/api';

export const useSummaryStore = create((set) => ({
  summaries: [],
  currentSummary: null,
  loading: false,
  error: null,
  selectedModel: 'gemini', // Gemini has a free tier — best default

  // Create text summary
  createTextSummary: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await summaryAPI.createTextSummary(data);
      set((state) => ({
        summaries: [response.data.data, ...state.summaries],
        currentSummary: response.data.data,
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create summary';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Upload file and create summary
  uploadFile: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await fileAPI.uploadFile(formData);
      set((state) => ({
        summaries: [response.data.data, ...state.summaries],
        currentSummary: response.data.data,
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload file';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Process URL
  processURL: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fileAPI.processURL(data);
      set((state) => ({
        summaries: [response.data.data, ...state.summaries],
        currentSummary: response.data.data,
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to process URL';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Get all summaries
  getSummaries: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await summaryAPI.getSummaries(params);
      set({ summaries: response.data.data.summaries, loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch summaries';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Get single summary
  getSummaryById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await summaryAPI.getSummaryById(id);
      set({ currentSummary: response.data.data, loading: false });
      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch summary';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Delete summary
  deleteSummary: async (id) => {
    set({ loading: true, error: null });
    try {
      await summaryAPI.deleteSummary(id);
      set((state) => ({
        summaries: state.summaries.filter((s) => s._id !== id),
        currentSummary: null,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete summary';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Toggle bookmark
  toggleBookmark: async (id) => {
    try {
      const response = await summaryAPI.toggleBookmark(id);
      set((state) => ({
        summaries: state.summaries.map((s) =>
          s._id === id ? response.data.data : s
        ),
        currentSummary: response.data.data,
      }));
    } catch (error) {
      throw error;
    }
  },

  // Set selected model
  setSelectedModel: (model) => set({ selectedModel: model }),

  // Clear error
  clearError: () => set({ error: null }),
}));
