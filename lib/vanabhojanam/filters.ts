/** `YYYY-MM-DD` bounds in local time. Either side may be empty. */
export const inDateRange = (value: string | Date | null | undefined, start?: string, end?: string): boolean => {
  if (!start && !end) return true;
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  if (start && date < new Date(`${start}T00:00:00`)) return false;
  if (end && date > new Date(`${end}T23:59:59.999`)) return false;
  return true;
};

/** Case-insensitive match across several fields; queries under 2 characters match everything. */
export const matchesSearch = (fields: unknown[], query: string): boolean => {
  if (query.length < 2) return true;
  const haystack = fields
    .map((v) => (v && v !== "-" ? String(v) : ""))
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
};

/**
 * Morning (08:00-16:00) / evening (16:00+) filter for scanned records.
 * Records on a different day than the selected start date are kept, matching the old behaviour.
 */
export const matchesTimeOfDay = (isoDate: string | null | undefined, timeFilter: string, startDate?: string): boolean => {
  if (!timeFilter || !isoDate) return true;
  const date = new Date(isoDate);
  if (startDate && date.toISOString().split("T")[0] !== startDate) return true;
  const hours = date.getHours();
  if (timeFilter === "morning") return hours >= 8 && hours < 16;
  if (timeFilter === "evening") return hours >= 16;
  return true;
};

/** Areas are typed by hand, so "MVP Colony" and "mvp  colony" are one area. The key is lower case with single spaces. */
export const areaKey = (value: unknown): string => String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();

/** Options for an Area filter: one per distinct area (first spelling seen is the label), sorted by name. */
export const areaOptions = (values: unknown[]): { value: string; label: string }[] => {
  const seen = new Map<string, string>();
  values.forEach((v) => {
    const key = areaKey(v);
    if (key && !seen.has(key)) seen.set(key, String(v).trim().replace(/\s+/g, " "));
  });
  return [...seen].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
};

export const uniqueSorted = (values: (string | null | undefined)[]): string[] =>
  ([...new Set(values.filter(Boolean))] as string[]).sort((a, b) => a.localeCompare(b));
