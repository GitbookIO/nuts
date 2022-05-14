import path from "path";
import { PecansReleaseDTO } from "../models";
import { OperatingSystem } from "./OperatingSystem";
import { PackageFormat } from "./PackageFormat";
import { Platform } from "./Platforms";
import {
  getSupportedExt,
  SupportedFileExtension,
  SUPPORTED_FILE_EXTENSIONS,
} from "./SupportedFileExtension";

// Resolve a platform for a version

export function resolveReleaseAssetForVersion(
  version: PecansReleaseDTO,
  platform: Platform,
  wanted?: string
) {
  const prefs: string[] = [...SUPPORTED_FILE_EXTENSIONS];

  // Put wanted at the top of the list... will fallback to other extensions.
  if (wanted) prefs.unshift(wanted);

  const compatibleAssets = version.assets.filter((asset) => {
    const ext = getSupportedExt(asset.filename) || "";
    return prefs.includes(ext) && asset.type.startsWith(platform);
  });

  const sorted = compatibleAssets.sort((p1, p2) => {
    // Compare by arhcitecture ("osx_64" > "osx")
    if (p1.type.length > p2.type.length) return -1;
    if (p2.type.length > p1.type.length) return 1;

    const ext1 = path.extname(p1.filename);
    const ext2 = path.extname(p2.filename);
    let pos1 = prefs.indexOf(ext1 as SupportedFileExtension);
    let pos2 = prefs.indexOf(ext2 as SupportedFileExtension);
    return pos1 - pos2;
  });
  return sorted[0];
}
