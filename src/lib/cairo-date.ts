export function cairoDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function cairoStartOfDay(date: Date, daysAgo = 0): Date {
  const key = cairoDayKey(date);
  const midnight = new Date(`${key}T00:00:00Z`);
  midnight.setUTCDate(midnight.getUTCDate() - daysAgo);
  const offsetPart = new Intl.DateTimeFormat("en-US", { timeZone: "Africa/Cairo", timeZoneName: "shortOffset" })
    .formatToParts(midnight).find((part) => part.type === "timeZoneName")?.value ?? "GMT+2";
  const offsetHours = Number(offsetPart.replace("GMT", "")) || 0;
  return new Date(midnight.getTime() - offsetHours * 60 * 60 * 1000);
}