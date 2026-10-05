import assert from "node:assert/strict";
import test from "node:test";
import { sql } from "drizzle-orm";
import { isTrainingConfirmationOpen } from "../shared/training-confirmation-window";
import { trainingConfirmationOpenSql } from "../server/services/training-confirmation-window";

const now = new Date("2026-10-05T17:00:00Z"); // 12:00 in Colombia
const cases = [
  { name: "future invitation", date: "2026-10-06", status: "programada", expected: true },
  { name: "expired invitation", date: "2026-10-04", status: "programada", expected: false },
  { name: "completed SST", date: "2026-10-06", status: "completada", expected: false },
  { name: "cancelled PESV", date: "2026-10-06", status: "cancelada", expected: false },
  { name: "completed program", date: "2026-10-06", status: "completado", expected: false },
  { name: "cancelled program", date: "2026-10-06", status: "cancelado", expected: false },
  { name: "unknown status", date: "2026-10-06", status: "unknown", expected: false },
  { name: "rescheduled program", date: "2026-10-06", status: "reprogramado", expected: true },
  { name: "ongoing PESV", date: "2026-10-05", status: "en-curso", endTime: "13:00", expected: true },
  { name: "end time reached", date: "2026-10-05", status: "programado", endTime: "12:00", expected: false },
  { name: "two hour fallback", date: "2026-10-05", status: "programada", startTime: "11:00", expected: true },
  { name: "two hour fallback expired", date: "2026-10-05", status: "programada", startTime: "09:00", expected: false },
  { name: "missing hours uses end of Colombia day", date: "2026-10-05", status: "programada", expected: true },
  { name: "invalid hours do not crash", date: "2026-10-05", status: "programada", startTime: "bad", endTime: "", expected: true },
  { name: "midnight is not interpreted as 23:59", date: "2026-10-05", status: "programada", endTime: "00:00", expected: false },
  { name: "multi-day program", date: "2026-10-04", endDate: "2026-10-06", status: "en_curso", expected: true },
];

for (const entry of cases) {
  test(entry.name, () => {
    assert.equal(isTrainingConfirmationOpen(entry, now), entry.expected);
  });
}

test("Colombia end of day is independent of the browser timezone", () => {
  const training = { date: "2026-10-05", status: "programada" };
  assert.equal(isTrainingConfirmationOpen(training, new Date("2026-10-06T04:59:59Z")), true);
  assert.equal(isTrainingConfirmationOpen(training, new Date("2026-10-06T05:00:00Z")), false);
});

test("SQL counter and portal agree for every confirmation window", {
  skip: !process.env.DATABASE_URL,
}, async () => {
  // Read-only SELECTs of constants; no user records or production data are modified.
  const { db, pool } = await import("../server/db");
  try {
    for (const entry of cases) {
      const input = entry as typeof entry & { startTime?: string; endTime?: string; endDate?: string };
      const result = await db.execute(sql`SELECT ${trainingConfirmationOpenSql(
        sql`${input.endDate || input.date}`,
        sql`${input.startTime || null}::text`,
        sql`${input.endTime || null}::text`,
        sql`${input.status}`,
        sql`${now.toISOString()}::timestamptz`,
      )} AS is_open`);
      assert.equal(result.rows[0].is_open, entry.expected, entry.name);
    }
  } finally {
    await pool.end();
  }
});
