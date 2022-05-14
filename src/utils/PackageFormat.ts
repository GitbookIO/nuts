import { ParsedQs } from "qs";
// TODO: more consistent use of explicit package name instead of assuming based on context
export const PACKAGE_FORMATS = [
  "deb",
  "rpm" /*"zip", "dmg", "tar", "nupkg"*/,
] as const;
export type PackageFormat = typeof PACKAGE_FORMATS[number];
// check if a string is an Package type identifier
export function isPackageFormat(obj: unknown): obj is PackageFormat {
  return (
    typeof obj == "string" && PACKAGE_FORMATS.includes(obj as PackageFormat)
  );
}

export function filenameToPackageFormat(
  filename: string
): PackageFormat | undefined {
  const name = filename.toLowerCase();
  if (name.endsWith(".deb")) return "deb";
  if (name.endsWith(".rpm")) return "rpm";
}

export function getPkgFromQuery(query: ParsedQs): PackageFormat | undefined {
  return query.pkg &&
    typeof query.pkg === "string" &&
    isPackageFormat(query.pkg)
    ? query.pkg
    : undefined;
}
