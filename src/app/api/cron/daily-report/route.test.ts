import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: vi.fn(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL
      || !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      throw new Error("Supabase admin environment variables are not configured.");
    }

    return { rpc };
  }),
}));

import { GET } from "./route";

describe("GET /api/cron/daily-report", () => {
  beforeEach(() => {
    vi.stubEnv("CRON_SECRET", "test-cron-secret");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
    rpc.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 401 when the cron secret is missing", async () => {
    const response = await GET(new Request("http://localhost/api/cron/daily-report"));

    expect(response.status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns 401 when the cron secret is invalid", async () => {
    const response = await GET(
      new Request("http://localhost/api/cron/daily-report", {
        headers: { authorization: "Bearer invalid" },
      }),
    );

    expect(response.status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns 500 when Supabase configuration is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");

    const response = await GET(
      new Request("http://localhost/api/cron/daily-report", {
        headers: { authorization: "Bearer test-cron-secret" },
      }),
    );

    expect(response.status).toBe(500);
  });

  it("refreshes and returns the previous daily report", async () => {
    const report = {
      report_date: "2026-09-13",
      new_users: 2,
      active_users: 3,
      total_calculations: 5,
      total_adjusted_amount: 120000,
    };
    rpc.mockResolvedValue({ data: report, error: null });

    const response = await GET(
      new Request("http://localhost/api/cron/daily-report", {
        headers: { authorization: "Bearer test-cron-secret" },
      }),
    );

    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("refresh_daily_report", {
      p_report_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
    await expect(response.json()).resolves.toEqual({
      reportDate: expect.any(String),
      report,
    });
  });

  it("returns 500 when the report RPC fails", async () => {
    rpc.mockResolvedValue({ data: null, error: new Error("Database error") });

    const response = await GET(
      new Request("http://localhost/api/cron/daily-report", {
        headers: { authorization: "Bearer test-cron-secret" },
      }),
    );

    expect(response.status).toBe(500);
  });
});
