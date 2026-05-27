// List of popular currencies for university tuition/application fees
export const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" }
];

// Fallback rates if exchange rate API is unavailable (approximate mid-market rates)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  CAD: 1.36,
  AUD: 1.50,
  SGD: 1.35,
  AED: 3.67,
  INR: 83.50,
  CNY: 7.24,
  JPY: 156.0
};

interface ExchangeRateResponse {
  result?: string;
  base_code?: string;
  rates?: Record<string, number>;
}

// Memory cache for rates (since this code is executed in Next.js backend)
let cachedRates: Record<string, number> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 4; // Cache rates for 4 hours

export async function getExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (cachedRates && now - lastFetchTime < CACHE_DURATION) {
    return cachedRates;
  }

  try {
    // Fetch live currency rates against base USD
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 14400 } // Cache in Next.js fetch layer for 4 hours too
    });

    if (!response.ok) throw new Error("Failed to fetch exchange rates");
    
    const data: ExchangeRateResponse = await response.json();
    if (data.rates) {
      cachedRates = data.rates;
      lastFetchTime = now;
      return data.rates;
    }
  } catch (error) {
    console.error("Error fetching live exchange rates, using fallback:", error);
  }

  // Fallback
  return FALLBACK_RATES;
}

export function convertToINR(
  amount: number | null | undefined,
  fromCurrency: string,
  rates: Record<string, number>
): number {
  if (amount === null || amount === undefined || isNaN(amount)) return 0;
  if (fromCurrency === "INR") return amount;

  const rateToUSD = rates[fromCurrency];
  const rateINR = rates["INR"] || 83.5;

  if (!rateToUSD) return amount * (FALLBACK_RATES["INR"] / (FALLBACK_RATES[fromCurrency] || 1));

  // Convert to USD first, then to INR
  const amountInUSD = amount / rateToUSD;
  const amountInINR = amountInUSD * rateINR;

  return Math.round(amountInINR * 100) / 100;
}
