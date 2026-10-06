import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/locations/route";
import { NextRequest } from "next/server";

describe("Locations API Route (/api/locations)", () => {
  it("returns Bangladesh as fixed country with isoCode, name, and flag", async () => {
    const req = new NextRequest("http://localhost:3000/api/locations?type=countries");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);

    const bangladesh = data.find((c: { isoCode: string }) => c.isoCode === "BD");
    expect(bangladesh).toBeDefined();
    expect(bangladesh.name).toBe("Bangladesh");
  });

  it("returns 8 divisions of Bangladesh for states", async () => {
    const req = new NextRequest("http://localhost:3000/api/locations?type=states&country=BD");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(8);

    const dhakaDivision = data.find((s: { name: string }) => s.name === "Dhaka");
    expect(dhakaDivision).toBeDefined();
  });

  it("returns districts for a valid state/division", async () => {
    const req = new NextRequest("http://localhost:3000/api/locations?type=cities&country=BD&state=DHAKA");
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(13); // Dhaka has 13 districts
  });

  it("returns 400 for invalid query parameters", async () => {
    const req = new NextRequest("http://localhost:3000/api/locations?type=invalid");
    const res = await GET(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });
});
