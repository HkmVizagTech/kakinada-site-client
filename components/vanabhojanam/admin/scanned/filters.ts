/** `YYYY-MM-DD` bounds in local time. Either side may be empty. */
export const inDateRange = (value: any, start: string, end: string) => {
  if (!start && !end) return true;
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  if (start && date < new Date(`${start}T00:00:00`)) return false;
  if (end && date > new Date(`${end}T23:59:59.999`)) return false;
  return true;
};

/** Case-insensitive match across several fields; queries under 2 characters match everything. */
export const matchesSearch = (fields: any[], query: string) => {
  if (query.length < 2) return true;
  const haystack = fields
    .map((v) => (v && v !== "-" ? String(v) : ""))
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
};

/** Morning (08:00-16:00) / evening (16:00+) filter. Records on a different day than the start date are kept. */
export const matchesTimeOfDay = (isoDate: any, timeFilter: string, startDate: string) => {
  if (!timeFilter || !isoDate) return true;
  const date = new Date(isoDate);
  if (startDate && date.toISOString().split("T")[0] !== startDate) return true;
  const hours = date.getHours();
  if (timeFilter === "morning") return hours >= 8 && hours < 16;
  if (timeFilter === "evening") return hours >= 16;
  return true;
};

export const uniqueSorted = (values: any[]): string[] => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
