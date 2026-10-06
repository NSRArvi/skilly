import { NextRequest, NextResponse } from "next/server";
import {
  BANGLADESH_COUNTRY,
  BANGLADESH_DIVISIONS,
  BANGLADESH_DISTRICTS_BY_DIVISION,
  ALL_BANGLADESH_DISTRICTS,
  normalizeDivisionKey,
} from "@/lib/locations";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const state = searchParams.get("state") || searchParams.get("division");

  const headers = {
    "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
  };

  if (type === "countries") {
    return NextResponse.json([BANGLADESH_COUNTRY], { headers });
  }

  if (type === "states" || type === "divisions") {
    return NextResponse.json(BANGLADESH_DIVISIONS, { headers });
  }

  if (type === "cities" || type === "districts") {
    if (!state || state === "all") {
      return NextResponse.json(ALL_BANGLADESH_DISTRICTS, { headers });
    }
    const key = normalizeDivisionKey(state);
    const districts = BANGLADESH_DISTRICTS_BY_DIVISION[key] || ALL_BANGLADESH_DISTRICTS;
    return NextResponse.json(districts, { headers });
  }

  return NextResponse.json(
    {
      error:
        "Invalid location query parameters. Provide type='countries', type='states', or type='cities'&state=...",
    },
    { status: 400 }
  );
}
