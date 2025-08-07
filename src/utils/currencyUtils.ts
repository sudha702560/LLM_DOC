// Currency conversion and formatting utilities for Indian Rupees

export interface ExchangeRates {
  USD_TO_INR: number;
  EUR_TO_INR: number;
  GBP_TO_INR: number;
}

// Current exchange rates (in production, fetch from API)
export const CURRENT_RATES: ExchangeRates = {
  USD_TO_INR: 83.25,
  EUR_TO_INR: 90.15,
  GBP_TO_INR: 105.50
};

/**
 * Convert USD amount to Indian Rupees
 */
export const convertUSDToINR = (usdAmount: number): number => {
  return usdAmount * CURRENT_RATES.USD_TO_INR;
};

/**
 * Format amount in Indian currency format
 */
export const formatINR = (amount: number, options?: {
  showDecimals?: boolean;
  useIndianNumbering?: boolean;
}): string => {
  const { showDecimals = false, useIndianNumbering = true } = options || {};
  
  if (useIndianNumbering) {
    // Indian numbering system (lakhs, crores)
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    }).format(amount);
  } else {
    // Standard international format
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: showDecimals ? 2 : 0
    }).format(amount);
  }
};

/**
 * Convert and format USD to INR in one step
 */
export const convertAndFormatUSDToINR = (usdAmount: number, options?: {
  showDecimals?: boolean;
  useIndianNumbering?: boolean;
}): string => {
  const inrAmount = convertUSDToINR(usdAmount);
  return formatINR(inrAmount, options);
};

/**
 * Format large numbers in Indian system (lakhs/crores)
 */
export const formatIndianNumbers = (amount: number): string => {
  if (amount >= 10000000) { // 1 crore
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) { // 1 lakh
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else if (amount >= 1000) { // 1 thousand
    return `₹${(amount / 1000).toFixed(1)}K`;
  } else {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
};

/**
 * Get real-time exchange rates (placeholder for API integration)
 */
export const fetchCurrentExchangeRates = async (): Promise<ExchangeRates> => {
  // In production, this would fetch from a currency API
  // For now, return current static rates
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(CURRENT_RATES);
    }, 100);
  });
};

/**
 * Validate and sanitize currency amounts
 */
export const sanitizeCurrencyAmount = (amount: string | number): number => {
  if (typeof amount === 'string') {
    // Remove currency symbols and parse
    const cleaned = amount.replace(/[₹$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return typeof amount === 'number' ? amount : 0;
};

/**
 * Currency conversion history tracking
 */
export interface ConversionRecord {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  timestamp: string;
}

export const trackConversion = (
  originalAmount: number,
  originalCurrency: string,
  convertedAmount: number,
  targetCurrency: string,
  exchangeRate: number
): ConversionRecord => {
  return {
    originalAmount,
    originalCurrency,
    convertedAmount,
    targetCurrency,
    exchangeRate,
    timestamp: new Date().toISOString()
  };
};