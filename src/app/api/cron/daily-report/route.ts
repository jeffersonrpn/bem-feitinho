import { timingSafeEqual } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function previousDateInSaoPaulo(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value;
  const year = part("year");
  const month = part("month");
  const day = part("day");

  if (!year || !month || !day) {
    throw new Error("Could not determine the report date.");
  }

  const saoPauloDate = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day)),
  );
  saoPauloDate.setUTCDate(saoPauloDate.getUTCDate() - 1);

  return saoPauloDate.toISOString().slice(0, 10);
}

function hasValidAuthorization(
  authorization: string | null,
  cronSecret: string,
) {
  if (!authorization) {
    return false;
  }

  const received = Buffer.from(authorization);
  const expected = Buffer.from(`Bearer ${cronSecret}`);

  return received.length === expected.length && timingSafeEqual(received, expected);
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return Response.json(
      { error: "Cron configuration is missing." },
      { status: 500 },
    );
  }

  if (!hasValidAuthorization(request.headers.get("authorization"), cronSecret)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const reportDate = previousDateInSaoPaulo();
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.rpc("refresh_daily_report", {
      p_report_date: reportDate,
    });

    if (error || !data) {
      throw error ?? new Error("Daily report was not returned.");
    }

    return Response.json({ reportDate, report: data });
  } catch (error) {
    console.error("Failed to refresh daily report.", error);

    return Response.json(
      { error: "Unable to refresh daily report." },
      { status: 500 },
    );
  }
}
