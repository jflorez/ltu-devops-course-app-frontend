import '@testing-library/jest-dom';
import { config } from '@vue/test-utils';
import { createApp } from 'vue';

// Mock ResizeObserver which is not available in jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Create a Vue instance for testing
const app = createApp({});

// Make it available globally
(global as any).Vue = app;

// Add any other global test setup here
