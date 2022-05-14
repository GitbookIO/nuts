import { Architecture, OperatingSystem, PackageFormat } from "../utils";
import { SupportedFileExtension } from "../utils/SupportedFileExtension";

export interface PecansAssetQuery {
  os?: OperatingSystem;
  arch?: Architecture;
  pkg?: PackageFormat;
  filename?: string;
  extensions?: SupportedFileExtension[];
}
