export interface LocationCountry {
  isoCode: string;
  name: string;
  flag?: string;
}

export interface LocationState {
  isoCode: string;
  name: string;
}

export interface LocationCity {
  name: string;
}

// In-memory cache to prevent duplicate network calls across components
let countriesCache: LocationCountry[] | null = null;
const statesCache = new Map<string, LocationState[]>();
const citiesCache = new Map<string, LocationCity[]>();

export async function fetchCountries(): Promise<LocationCountry[]> {
  if (countriesCache) return countriesCache;

  try {
    const res = await fetch("/api/locations?type=countries");
    if (!res.ok) throw new Error("Failed to load countries");
    const data: LocationCountry[] = await res.json();
    countriesCache = data;
    return data;
  } catch (err) {
    console.error("fetchCountries error:", err);
    return [
      { isoCode: "BD", name: "Bangladesh" },
      { isoCode: "US", name: "United States" },
      { isoCode: "GB", name: "United Kingdom" },
      { isoCode: "CA", name: "Canada" },
    ];
  }
}

export async function fetchStates(countryCode: string): Promise<LocationState[]> {
  if (!countryCode || countryCode === "all") return [];
  if (statesCache.has(countryCode)) return statesCache.get(countryCode)!;

  try {
    const res = await fetch(`/api/locations?type=states&country=${encodeURIComponent(countryCode)}`);
    if (!res.ok) throw new Error("Failed to load states");
    const data: LocationState[] = await res.json();
    statesCache.set(countryCode, data);
    return data;
  } catch (err) {
    console.error("fetchStates error:", err);
    return [];
  }
}

export async function fetchCities(countryCode: string, stateCode: string): Promise<LocationCity[]> {
  if (!countryCode || !stateCode || countryCode === "all" || stateCode === "all") return [];
  const key = `${countryCode}:${stateCode}`;
  if (citiesCache.has(key)) return citiesCache.get(key)!;

  try {
    const res = await fetch(`/api/locations?type=cities&country=${encodeURIComponent(countryCode)}&state=${encodeURIComponent(stateCode)}`);
    if (!res.ok) throw new Error("Failed to load cities");
    const data: LocationCity[] = await res.json();
    citiesCache.set(key, data);
    return data;
  } catch (err) {
    console.error("fetchCities error:", err);
    return [];
  }
}
