import { sql, type SQL } from "drizzle-orm";
import { ACTIVE_TRAINING_STATUSES, TRAINING_TIME_PATTERN } from "../../shared/training-confirmation-window";

// Keep the SQL counter and the portal's Confirm button on the same deadline.
export function trainingConfirmationOpenSql(
  date: SQL,
  startTime: SQL,
  endTime: SQL,
  status: SQL,
  now: SQL = sql`now()`,
): SQL {
  return sql`(
    ${status}::text IN (${sql.join(ACTIVE_TRAINING_STATUSES.map(value => sql`${value}`), sql`, `)})
    AND (
      CASE
        WHEN ${endTime} ~ ${TRAINING_TIME_PATTERN}
          THEN ${date}::date + ${endTime}::time
        WHEN ${startTime} ~ ${TRAINING_TIME_PATTERN}
          THEN ${date}::date + ${startTime}::time + interval '2 hours'
        ELSE ${date}::date + time '23:59:59.999'
      END AT TIME ZONE 'America/Bogota'
    ) > ${now}
  )`;
}
