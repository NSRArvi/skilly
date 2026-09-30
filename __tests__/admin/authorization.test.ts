import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the server-side Supabase client
vi.mock("@/lib/server", () => ({
  createClient: vi.fn(),
}));

import { createClient } from "@/lib/server";
import {
  toggleProfessionalVerification,
  toggleJobVerification,
  getOrders,
  getSupportMessages,
  getKycSignedUrl,
  getKycSignedUrls,
} from "@/app/admin/actions";

describe("Admin Server Actions Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unauthenticated requests with Unauthorized", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const verifyResult = await toggleProfessionalVerification("user-1", true);
    expect(verifyResult).toEqual({ success: false, error: "Unauthorized" });

    const jobResult = await toggleJobVerification("job-1", true);
    expect(jobResult).toEqual({ success: false, error: "Unauthorized" });

    const ordersResult = await getOrders();
    expect(ordersResult).toEqual({ success: false, error: "Unauthorized" });

    const messagesResult = await getSupportMessages();
    expect(messagesResult).toEqual({ success: false, error: "Unauthorized" });
  });

  it("rejects non-admin authenticated users with Unauthorized", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: { id: "regular-user", email: "user@example.com" },
          },
        }),
      },
    } as unknown as Awaited<ReturnType<typeof createClient>>);

    const verifyResult = await toggleProfessionalVerification("user-1", true);
    expect(verifyResult).toEqual({ success: false, error: "Unauthorized" });

    const ordersResult = await getOrders();
    expect(ordersResult).toEqual({ success: false, error: "Unauthorized" });

    const kycResult = await getKycSignedUrl("test-doc.jpg");
    expect(kycResult).toEqual({ success: false, error: "Unauthorized" });

    const kycBatchResult = await getKycSignedUrls({ front: "front.jpg" });
    expect(kycBatchResult).toEqual({ success: false, error: "Unauthorized" });
  });
});
