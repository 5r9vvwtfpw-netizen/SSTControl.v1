// Confirmation deadlines use Colombia's business timezone, not the browser's timezone.
export const ACTIVE_TRAINING_STATUSES = [
  "programado", "en_curso", "reprogramado",
  "programada", "en-curso", "scheduled", "in-progress",
] as const;

export const TRAINING_TIME_PATTERN = "^(?:[01][0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?$";

export function isTrainingConfirmationOpen(
  training: {
    date: string;
    endDate?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    status: string;
  },
  now: Date = new Date(),
): boolean {
  if (!(ACTIVE_TRAINING_STATUSES as readonly string[]).includes(training.status)) return false;
  const endDate = (training.endDate || training.date).slice(0, 10);
  const validTime = (value?: string | null) =>
    !!value && new RegExp(TRAINING_TIME_PATTERN).test(value);
  let deadline: number;
  if (validTime(training.endTime)) {
    deadline = Date.parse(`${endDate}T${training.endTime!.length === 5 ? training.endTime + ":00" : training.endTime}-05:00`);
  } else if (validTime(training.startTime)) {
    deadline = Date.parse(`${endDate}T${training.startTime!.length === 5 ? training.startTime + ":00" : training.startTime}-05:00`) + 2 * 60 * 60 * 1000;
  } else {
    deadline = Date.parse(`${endDate}T23:59:59.999-05:00`);
  }
  return Number.isFinite(deadline) && deadline > now.getTime();
}
