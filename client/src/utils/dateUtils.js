// Utility functions for date handling in EST/EDT timezone

/**
 * Get current date in EST/EDT timezone in YYYY-MM-DD format
 * @returns {string} Current date in YYYY-MM-DD format
 */
export const getCurrentDateEST = () => {
  const now = new Date();
  
  // Convert to EST/EDT timezone
  const estDate = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  
  const year = estDate.getFullYear();
  const month = String(estDate.getMonth() + 1).padStart(2, '0');
  const day = String(estDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format a date string for display in EST/EDT timezone
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDateEST = (dateString, options = {}) => {
  const date = new Date(dateString + 'T00:00:00'); // Add time to avoid timezone issues
  return date.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    ...options
  });
};

/**
 * Convert a date string to a Date object in EST/EDT timezone
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {Date} Date object
 */
export const parseDateEST = (dateString) => {
  return new Date(dateString + 'T00:00:00');
};
