/** Writes `rows` (array of flat objects) to an .xlsx download. The spreadsheet library loads on demand. */
export async function exportToExcel({ rows, sheetName, fileName }: { rows: Record<string, any>[]; sheetName: string; fileName: string }) {
  const XLSX = await import("xlsx");
  // Blank (not missing) cells, so no column ever comes out empty, and widths that fit the content.
  const clean = rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value ?? ""])));
  const worksheet = XLSX.utils.json_to_sheet(clean);
  const headers = Object.keys(clean[0] || {});
  worksheet["!cols"] = headers.map((key) => ({
    wch: Math.min(40, Math.max(key.length, ...clean.slice(0, 200).map((row) => String(row[key]).length)) + 2),
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
