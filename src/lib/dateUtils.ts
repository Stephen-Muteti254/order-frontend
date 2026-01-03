export const EAT_TIMEZONE = 'Africa/Nairobi';

export function formatEAT(
  iso: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
) {
  const date = typeof iso === 'string' ? new Date(iso) : iso;

  return new Intl.DateTimeFormat('en-KE', {
    timeZone: EAT_TIMEZONE,
    ...options,
  }).format(date);
}
