const SECONDS_PER_MINUTE = 60;
const SECONDS_PAD = 2;

export function formatDuration(totalSeconds: number): string {
  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / SECONDS_PER_MINUTE);
  const seconds = rounded % SECONDS_PER_MINUTE;
  return `${minutes}:${String(seconds).padStart(SECONDS_PAD, '0')}`;
}
