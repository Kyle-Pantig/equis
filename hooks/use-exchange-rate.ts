import { useState, useEffect } from "react";

const FALLBACK_RATE = 56;
const CACHE_KEY = "exchangeRate_USD_PHP";
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface CachedRate {
  rate: number;
  timestamp: number;
}

export function useExchangeRate() {
  const [rate, setRate] = useState<number>(FALLBACK_RATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage cache first
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedRate = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          setRate(parsed.rate);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore cache read errors
    }

    const controller = new AbortController();

    async function fetchRate() {
      try {
        const res = await fetch(
          `https://v6.exchangerate-api.com/v6/${process.env.NEXT_PUBLIC_EXCHANGE_RATE_API_KEY}/pair/USD/PHP`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("API request failed");
        const data = await res.json();
        if (data.result === "success") {
          setRate(data.conversion_rate);
          setError(null);
          // Cache the result
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                rate: data.conversion_rate,
                timestamp: Date.now(),
              } satisfies CachedRate)
            );
          } catch {
            // ignore cache write errors
          }
        } else {
          throw new Error("Unexpected API response");
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Using fallback rate");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchRate();

    return () => controller.abort();
  }, []);

  return { rate, loading, error };
}
