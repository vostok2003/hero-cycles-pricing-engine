/**
 * Format a number as Indian Rupee currency
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date string to readable format
 */
export const formatDate = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Format a date to include time
 */
export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Get category badge CSS class
 */
export const getCategoryBadge = (category) => {
  const map = {
    Frame: 'badge-blue',
    Tyre: 'badge-green',
    'Gear Set': 'badge-amber',
    Seat: 'badge-slate',
    Brake: 'badge-red',
  };
  return map[category] || 'badge-slate';
};

/**
 * Extract error message from axios error
 */
export const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.msg ||
    error?.message ||
    'An unexpected error occurred'
  );
};
