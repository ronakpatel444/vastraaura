export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
  defaultMultiplier: number; // e.g. 1.0 for India, 2.5 for Tier-1
  exchangeRateFromInr: number; // 1 Foreign Currency Unit = X INR
  isTier1: boolean;
  allowCOD: boolean;
}

export const COUNTRIES: Record<string, CountryConfig> = {
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    defaultMultiplier: 1.0,
    exchangeRateFromInr: 1,
    isTier1: false,
    allowCOD: true,
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    symbol: '$',
    defaultMultiplier: 2.5,
    exchangeRateFromInr: 87, // ~$1 = 87 INR
    isTier1: true,
    allowCOD: false,
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    symbol: '£',
    defaultMultiplier: 2.5,
    exchangeRateFromInr: 112, // ~£1 = 112 INR
    isTier1: true,
    allowCOD: false,
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    symbol: 'CA$',
    defaultMultiplier: 2.5,
    exchangeRateFromInr: 64, // ~CA$1 = 64 INR
    isTier1: true,
    allowCOD: false,
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    symbol: 'A$',
    defaultMultiplier: 2.5,
    exchangeRateFromInr: 57, // ~A$1 = 57 INR
    isTier1: true,
    allowCOD: false,
  },
  EU: {
    code: 'EU',
    name: 'Europe',
    flag: '🇪🇺',
    currency: 'EUR',
    symbol: '€',
    defaultMultiplier: 2.5,
    exchangeRateFromInr: 95, // ~€1 = 95 INR
    isTier1: true,
    allowCOD: false,
  },
  AE: {
    code: 'AE',
    name: 'UAE',
    flag: '🇦🇪',
    currency: 'AED',
    symbol: 'AED ',
    defaultMultiplier: 2.2,
    exchangeRateFromInr: 23.7, // ~1 AED = 23.7 INR
    isTier1: true,
    allowCOD: false,
  },
};

export const COUNTRY_LIST: CountryConfig[] = Object.values(COUNTRIES);

/**
 * Extracts numeric value from a price string like "₹1,499" or "1499"
 */
export function parseInrPrice(rawPrice: string | number | undefined | null): number {
  if (rawPrice === undefined || rawPrice === null) return 0;
  if (typeof rawPrice === 'number') return Math.max(0, Math.round(rawPrice));
  const cleaned = String(rawPrice).replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

export interface ConvertedPriceResult {
  rawBaseInr: number;
  finalInrEquivalent: number;
  amount: number;
  formatted: string;
  currency: string;
  symbol: string;
  countryCode: string;
  isInternational: boolean;
}

/**
 * Converts a base INR price to the target country's currency applying Tier-1 multiplier
 */
export function convertPrice(
  rawPrice: string | number | undefined | null,
  countryCode: string = 'IN',
  customMultiplier?: number
): ConvertedPriceResult {
  const baseInr = parseInrPrice(rawPrice);
  const country = COUNTRIES[countryCode] || COUNTRIES.IN;

  if (country.code === 'IN' || baseInr <= 0) {
    return {
      rawBaseInr: baseInr,
      finalInrEquivalent: baseInr,
      amount: baseInr,
      formatted: `₹${baseInr.toLocaleString('en-IN')}`,
      currency: 'INR',
      symbol: '₹',
      countryCode: 'IN',
      isInternational: false,
    };
  }

  // Tier-1 Multiplier (e.g. 2.5x or custom from admin)
  const multiplier = (customMultiplier && customMultiplier > 0) ? customMultiplier : country.defaultMultiplier;
  const internationalInr = Math.round(baseInr * multiplier);
  
  // Convert INR to foreign currency
  const foreignVal = Math.round(internationalInr / country.exchangeRateFromInr);

  return {
    rawBaseInr: baseInr,
    finalInrEquivalent: internationalInr,
    amount: foreignVal,
    formatted: `${country.symbol}${foreignVal.toLocaleString('en-US')}`,
    currency: country.currency,
    symbol: country.symbol,
    countryCode: country.code,
    isInternational: true,
  };
}

/**
 * Shortcut to get clean formatted string (e.g. "$43" or "₹1,499")
 */
export function formatCurrencyPrice(
  rawPrice: string | number | undefined | null,
  countryCode: string = 'IN',
  customMultiplier?: number
): string {
  return convertPrice(rawPrice, countryCode, customMultiplier).formatted;
}
