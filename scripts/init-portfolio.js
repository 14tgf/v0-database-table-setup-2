/**
 * Initialize Portfolio Price Updates
 * Run this script to set up automatic price updates for portfolio stocks
 */

const http = require('http');

async function initPortfolioUpdates() {
  console.log('[Portfolio] Initializing stock price updates...');
  
  try {
    const response = await fetch(
      'http://localhost:3000/api/portfolio/update-prices',
      { method: 'POST' }
    );
    
    const data = await response.json();
    console.log('[Portfolio] Init response:', data);
    
    if (data.success) {
      console.log(`[Portfolio] Successfully updated ${data.updated} stocks`);
      console.log('[Portfolio] Price updates initialized!');
    }
  } catch (error) {
    console.error('[Portfolio] Error initializing updates:', error.message);
    console.log('[Portfolio] Portfolio system is ready, but prices will update on first portfolio access');
  }
}

initPortfolioUpdates();
