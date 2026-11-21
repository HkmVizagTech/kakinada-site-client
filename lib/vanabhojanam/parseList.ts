/**
 * Turns pasted text or a CSV into [{ name, phone }]. One person per line: "Name, 9876543210" (a comma, tab or semicolon
 * between them; the number may come first). A header line such as "Name, Phone" is skipped.
 */
export function parseDevoteeList(text: unknown): { name: string; phone: string }[] {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[,\t;]/).map((p) => p.trim().replace(/^"|"$/g, ""));
      const phonePart = parts.find((p) => p.replace(/\D/g, "").length >= 10) ?? parts[1] ?? "";
      const name = parts.filter((p) => p !== phonePart).join(" ").trim();
      return { name, phone: phonePart };
    })
    .filter((row) => !/^(name|devotee)/i.test(row.name) || row.phone.replace(/\D/g, "").length >= 10);
}
