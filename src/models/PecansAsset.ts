import { extname } from "path";
import {
  Architecture,
  filenameToArchitecture,
  filenameToOperatingSystem,
  filenameToPackageFormat,
  OperatingSystem,
  PackageFormat,
  Platform,
} from "../utils";
import { SupportedFileExtension } from "../utils/SupportedFileExtension";
import { PecansAssetQuery } from "./PecansAssetQuery";

export interface PecansAssetDTO {
  content_type: string;
  filename: string;
  id: string;
  raw: any;
  size: number;
  // TODO:  use os, arch, and pkg in place of platform.
  type: Platform;
}

export class PecansAsset implements PecansAssetDTO {
  os: OperatingSystem;
  arch: Architecture;
  pkg?: PackageFormat;
  id: string;
  filename: string;
  type: Platform;
  size: number;
  content_type: string;
  raw: any;

  constructor(dto: PecansAssetDTO) {
    this.content_type = dto.content_type;
    this.filename = dto.filename;
    this.id = dto.id;
    this.raw = dto.raw;
    this.size = dto.size;
    this.type = dto.type;
    this.os = filenameToOperatingSystem(this.filename);
    this.arch = filenameToArchitecture(this.filename, this.os);
    this.pkg = filenameToPackageFormat(this.filename);
  }

  satisfiesQuery(query: PecansAssetQuery) {
    return (
      this.satisfiesOS(query.os) &&
      this.satisfiesArch(query.arch) &&
      this.satisfiesPkg(query.pkg) &&
      this.satisfiesFilename(query.filename) &&
      this.satisfiesExtensions(query.extensions)
    );
  }

  satisfiesOS(os?: OperatingSystem) {
    return os == undefined || this.os == os;
  }

  satisfiesArch(arch?: Architecture) {
    return arch == undefined || this.arch == arch;
  }

  satisfiesPkg(pkg?: PackageFormat) {
    return pkg == undefined || this.pkg == pkg;
  }

  satisfiesFilename(filename?: string) {
    return filename == undefined || this.filename == filename;
  }

  satisfiesExtensions(extensions?: SupportedFileExtension[]) {
    if (!extensions) return true;
    const ext = extname(this.filename);
    return extensions.includes(ext as SupportedFileExtension);
  }
}
