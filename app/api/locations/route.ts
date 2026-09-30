import { NextRequest, NextResponse } from "next/server";
import { Country, State, City } from "country-state-city";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const country = searchParams.get("country");
  const state = searchParams.get("state");

  const headers = {
    "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
  };

  if (type === "countries") {
    const countries = Country.getAllCountries().map((c) => ({
      isoCode: c.isoCode,
      name: c.name,
      flag: c.flag,
    }));
    return NextResponse.json(countries, { headers });
  }

  if (type === "states" && country) {
    const states = State.getStatesOfCountry(country).map((s) => ({
      isoCode: s.isoCode,
      name: s.name,
    }));
    return NextResponse.json(states, { headers });
  }

  if (type === "cities" && country && state) {
    const cities = City.getCitiesOfState(country, state).map((c) => ({
      name: c.name,
    }));
    return NextResponse.json(cities, { headers });
  }

  return NextResponse.json(
    { error: "Invalid location query parameters. Provide type='countries', or type='states'&country=..., or type='cities'&country=...&state=..." },
    { status: 400 }
  );
}
