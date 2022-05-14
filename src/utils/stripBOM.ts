// Strip UTF-8 byte order mark (BOM) from a string
export function stripBom(string: string): string {
  if (typeof string !== "string") {
    throw new TypeError(`Expected a string, got ${typeof string}`);
  }

  // Catches EFBBBF (UTF-8 BOM) because the buffer-to-string
  // conversion translates it to FEFF (UTF-16 BOM).
  if (string.charCodeAt(0) === 0xfeff) {
    return string.slice(1);
  }

  return string;
}
