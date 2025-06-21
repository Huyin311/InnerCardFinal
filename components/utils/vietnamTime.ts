export function toVietnamTime(
  utcString?: string,
  format: string = "DD/MM/YYYY HH:mm",
) {
  if (!utcString) return "";

  const raw = String(utcString).replace(" ", "T");
  // Luôn parse thành UTC (dù có Z hay không)
  const timestamp = Date.parse(raw.endsWith("Z") ? raw : raw + "Z");
  if (isNaN(timestamp)) return "";

  // Cộng đúng 7 tiếng (7 * 60 * 60 * 1000 ms)
  const vnDate = new Date(timestamp + 7 * 60 * 60 * 1000);

  // Lấy các trường từ UTC (không dùng local)
  const pad = (n: number) => (n < 10 ? "0" + n : n.toString());
  const day = pad(vnDate.getUTCDate());
  const month = pad(vnDate.getUTCMonth() + 1);
  const year = vnDate.getUTCFullYear();
  const hour = pad(vnDate.getUTCHours());
  const minute = pad(vnDate.getUTCMinutes());

  let result = format
    .replace("DD", day)
    .replace("MM", month)
    .replace("YYYY", String(year))
    .replace("HH", hour)
    .replace("mm", minute);

  return result;
}
