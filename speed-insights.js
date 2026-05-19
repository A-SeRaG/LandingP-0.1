/**
 * Vercel Speed Insights initialization
 * This script initializes and configures Vercel Speed Insights for the site
 */
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Speed Insights with default configuration
injectSpeedInsights({
  debug: false, // Set to true for development debugging
  // sampleRate: 1, // 100% of events sent (default)
  // beforeSend: (event) => event, // Optional middleware to modify events
});
