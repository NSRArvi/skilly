export interface LocationCountry {
  isoCode: string;
  name: string;
  flag?: string;
}

export interface LocationState {
  isoCode: string;
  name: string;
  bnName?: string;
}

export interface LocationCity {
  name: string;
  bnName?: string;
  divisionCode?: string;
}

// 8 Divisions of Bangladesh
export const BANGLADESH_DIVISIONS: LocationState[] = [
  { isoCode: "DHAKA", name: "Dhaka", bnName: "ঢাকা" },
  { isoCode: "CHATTOGRAM", name: "Chattogram", bnName: "চট্টগ্রাম" },
  { isoCode: "RAJSHAHI", name: "Rajshahi", bnName: "রাজশাহী" },
  { isoCode: "KHULNA", name: "Khulna", bnName: "খুলনা" },
  { isoCode: "BARISHAL", name: "Barishal", bnName: "বরিশাল" },
  { isoCode: "SYLHET", name: "Sylhet", bnName: "সিলেট" },
  { isoCode: "RANGPUR", name: "Rangpur", bnName: "রংপুর" },
  { isoCode: "MYMENSINGH", name: "Mymensingh", bnName: "ময়মনসিংহ" },
];

// 64 Districts organized by their 8 Divisions
export const BANGLADESH_DISTRICTS_BY_DIVISION: Record<string, LocationCity[]> = {
  DHAKA: [
    { name: "Dhaka", bnName: "ঢাকা", divisionCode: "DHAKA" },
    { name: "Gazipur", bnName: "গাজীপুর", divisionCode: "DHAKA" },
    { name: "Narayanganj", bnName: "নারায়ণগঞ্জ", divisionCode: "DHAKA" },
    { name: "Tangail", bnName: "টাঙ্গাইল", divisionCode: "DHAKA" },
    { name: "Kishoreganj", bnName: "কিশোরগঞ্জ", divisionCode: "DHAKA" },
    { name: "Manikganj", bnName: "মানিকগঞ্জ", divisionCode: "DHAKA" },
    { name: "Munshiganj", bnName: "মুন্সীগঞ্জ", divisionCode: "DHAKA" },
    { name: "Narsingdi", bnName: "নরসিংদী", divisionCode: "DHAKA" },
    { name: "Faridpur", bnName: "ফরিদপুর", divisionCode: "DHAKA" },
    { name: "Gopalganj", bnName: "গোপালগঞ্জ", divisionCode: "DHAKA" },
    { name: "Madaripur", bnName: "মাদারীপুর", divisionCode: "DHAKA" },
    { name: "Rajbari", bnName: "রাজবাড়ী", divisionCode: "DHAKA" },
    { name: "Shariatpur", bnName: "শরীয়তপুর", divisionCode: "DHAKA" },
  ],
  CHATTOGRAM: [
    { name: "Chattogram", bnName: "চট্টগ্রাম", divisionCode: "CHATTOGRAM" },
    { name: "Cox's Bazar", bnName: "কক্সবাজার", divisionCode: "CHATTOGRAM" },
    { name: "Cumilla", bnName: "কুমিল্লা", divisionCode: "CHATTOGRAM" },
    { name: "Brahmanbaria", bnName: "ব্রাহ্মণবাড়িয়া", divisionCode: "CHATTOGRAM" },
    { name: "Chandpur", bnName: "চাঁদপুর", divisionCode: "CHATTOGRAM" },
    { name: "Feni", bnName: "ফেনী", divisionCode: "CHATTOGRAM" },
    { name: "Lakshmipur", bnName: "লক্ষ্মীপুর", divisionCode: "CHATTOGRAM" },
    { name: "Noakhali", bnName: "নোয়াখালী", divisionCode: "CHATTOGRAM" },
    { name: "Khagrachhari", bnName: "খাগড়াছড়ি", divisionCode: "CHATTOGRAM" },
    { name: "Rangamati", bnName: "রাঙ্গামাটি", divisionCode: "CHATTOGRAM" },
    { name: "Bandarban", bnName: "বান্দরবান", divisionCode: "CHATTOGRAM" },
  ],
  RAJSHAHI: [
    { name: "Rajshahi", bnName: "রাজশাহী", divisionCode: "RAJSHAHI" },
    { name: "Bogura", bnName: "বগুড়া", divisionCode: "RAJSHAHI" },
    { name: "Pabna", bnName: "পাবনা", divisionCode: "RAJSHAHI" },
    { name: "Sirajganj", bnName: "সিরাজগঞ্জ", divisionCode: "RAJSHAHI" },
    { name: "Naogaon", bnName: "নওগাঁ", divisionCode: "RAJSHAHI" },
    { name: "Natore", bnName: "নাটোর", divisionCode: "RAJSHAHI" },
    { name: "Chapainawabganj", bnName: "চাঁপাইনবাবগঞ্জ", divisionCode: "RAJSHAHI" },
    { name: "Joypurhat", bnName: "জয়পুরহাট", divisionCode: "RAJSHAHI" },
  ],
  KHULNA: [
    { name: "Khulna", bnName: "খুলনা", divisionCode: "KHULNA" },
    { name: "Jashore", bnName: "যশোর", divisionCode: "KHULNA" },
    { name: "Satkhira", bnName: "সাতক্ষীরা", divisionCode: "KHULNA" },
    { name: "Bagerhat", bnName: "বাগেরহাট", divisionCode: "KHULNA" },
    { name: "Kushtia", bnName: "কুষ্টিয়া", divisionCode: "KHULNA" },
    { name: "Chuadanga", bnName: "চুয়াডাঙ্গা", divisionCode: "KHULNA" },
    { name: "Meherpur", bnName: "মেহেরপুর", divisionCode: "KHULNA" },
    { name: "Jhenaidah", bnName: "ঝিনাইদহ", divisionCode: "KHULNA" },
    { name: "Magura", bnName: "মাগুরা", divisionCode: "KHULNA" },
    { name: "Narail", bnName: "নড়াইল", divisionCode: "KHULNA" },
  ],
  BARISHAL: [
    { name: "Barishal", bnName: "বরিশাল", divisionCode: "BARISHAL" },
    { name: "Bhola", bnName: "ভোলা", divisionCode: "BARISHAL" },
    { name: "Patuakhali", bnName: "পটুয়াখালী", divisionCode: "BARISHAL" },
    { name: "Pirojpur", bnName: "পিরোজপুর", divisionCode: "BARISHAL" },
    { name: "Barguna", bnName: "বরগুনা", divisionCode: "BARISHAL" },
    { name: "Jhalokati", bnName: "ঝালকাঠি", divisionCode: "BARISHAL" },
  ],
  SYLHET: [
    { name: "Sylhet", bnName: "সিলেট", divisionCode: "SYLHET" },
    { name: "Moulvibazar", bnName: "মৌলভীবাজার", divisionCode: "SYLHET" },
    { name: "Habiganj", bnName: "হবিগঞ্জ", divisionCode: "SYLHET" },
    { name: "Sunamganj", bnName: "সুনামগঞ্জ", divisionCode: "SYLHET" },
  ],
  RANGPUR: [
    { name: "Rangpur", bnName: "রংপুর", divisionCode: "RANGPUR" },
    { name: "Dinajpur", bnName: "দিনাজপুর", divisionCode: "RANGPUR" },
    { name: "Gaibandha", bnName: "গাইবান্ধা", divisionCode: "RANGPUR" },
    { name: "Kurigram", bnName: "কুড়িগ্রাম", divisionCode: "RANGPUR" },
    { name: "Lalmonirhat", bnName: "লালমনিরহাট", divisionCode: "RANGPUR" },
    { name: "Nilphamari", bnName: "নীলফামারী", divisionCode: "RANGPUR" },
    { name: "Panchagarh", bnName: "পঞ্চগড়", divisionCode: "RANGPUR" },
    { name: "Thakurgaon", bnName: "ঠাকুরগাঁও", divisionCode: "RANGPUR" },
  ],
  MYMENSINGH: [
    { name: "Mymensingh", bnName: "ময়মনসিংহ", divisionCode: "MYMENSINGH" },
    { name: "Jamalpur", bnName: "জামালপুর", divisionCode: "MYMENSINGH" },
    { name: "Netrokona", bnName: "নেত্রকোণা", divisionCode: "MYMENSINGH" },
    { name: "Sherpur", bnName: "শেরপুর", divisionCode: "MYMENSINGH" },
  ],
};

// Flattened list of all 64 districts
export const ALL_BANGLADESH_DISTRICTS: LocationCity[] = Object.values(
  BANGLADESH_DISTRICTS_BY_DIVISION
).flat();

export const BANGLADESH_COUNTRY: LocationCountry = {
  isoCode: "BD",
  name: "Bangladesh",
  flag: "🇧🇩",
};

/**
 * Normalizes a division code or name to match keys in BANGLADESH_DISTRICTS_BY_DIVISION
 */
export function normalizeDivisionKey(divisionOrState: string): string {
  if (!divisionOrState) return "";
  const upper = divisionOrState.toUpperCase().trim();
  
  if (BANGLADESH_DISTRICTS_BY_DIVISION[upper]) return upper;

  // Handle aliases & legacy codes
  if (upper.includes("DHAKA") || upper === "13" || upper === "DH") return "DHAKA";
  if (upper.includes("CHATTOGRAM") || upper.includes("CHITTAGONG") || upper === "B" || upper === "CTG") return "CHATTOGRAM";
  if (upper.includes("RAJSHAHI") || upper === "54" || upper === "RAJ") return "RAJSHAHI";
  if (upper.includes("KHULNA") || upper === "27" || upper === "KHU") return "KHULNA";
  if (upper.includes("BARISHAL") || upper.includes("BARISAL") || upper === "06" || upper === "BAR") return "BARISHAL";
  if (upper.includes("SYLHET") || upper === "60" || upper === "SYL") return "SYLHET";
  if (upper.includes("RANGPUR") || upper === "55" || upper === "RAN") return "RANGPUR";
  if (upper.includes("MYMENSINGH") || upper === "MYM") return "MYMENSINGH";

  return upper;
}

export async function fetchCountries(): Promise<LocationCountry[]> {
  return [BANGLADESH_COUNTRY];
}

export async function fetchStates(_countryCode?: string): Promise<LocationState[]> {
  return BANGLADESH_DIVISIONS;
}

export async function fetchCities(
  _countryCode?: string,
  stateCodeOrName?: string
): Promise<LocationCity[]> {
  if (!stateCodeOrName || stateCodeOrName === "all") {
    return ALL_BANGLADESH_DISTRICTS;
  }
  const key = normalizeDivisionKey(stateCodeOrName);
  return BANGLADESH_DISTRICTS_BY_DIVISION[key] || ALL_BANGLADESH_DISTRICTS;
}
