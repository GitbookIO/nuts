import { satisfies, validRange } from "semver";
import { channelFromVersion as channelFromVersion } from "../utils";
import { PecansAssetQuery } from "./PecansAssetQuery";
import { PecansAsset, PecansAssetDTO } from "./PecansAsset";
import { PecansReleaseQuery } from "./PecansReleaseQuery";

export interface PecansReleaseDTO {
  // version
  assets: PecansAssetDTO[];
  channel: string;
  notes: string;
  // missing published_at indicates a draft that hasn't been published.
  published_at: Date;
  version: string;
}

export class PecansRelease implements PecansReleaseDTO {
  assets: PecansAsset[];
  channel: string;
  notes: string;
  published_at: Date;
  version: string;

  constructor(dto: PecansReleaseDTO) {
    this.assets = dto.assets.map((assetDTO) => {
      const asset = new PecansAsset(assetDTO);
      return asset;
    });
    this.channel = channelFromVersion(dto.version);
    this.notes = dto.notes;
    this.published_at = dto.published_at;
    this.version = dto.version;
  }

  satisfiesQuery(query: PecansReleaseQuery): boolean {
    return (
      this.satisfiesChannel(query.channel) &&
      this.satisfiesSemVerRange(query.version) &&
      this.queryAssets(query).length > 0
    );
  }

  queryAssets(query: PecansAssetQuery) {
    return this.assets.filter((asset) => asset.satisfiesQuery(query));
  }

  satisfiesChannel(channel?: string) {
    if (channel == undefined) return true;
    if (channel == "*") return true;
    return this.channel == channel;
  }

  satisfiesSemVerRange(range?: string) {
    if (range == undefined) return true;
    // latest isn't actually applicable to single entries.
    // we ignore it here so prefiltering by other props will still work
    // latest will need to be handled in a post filter.
    if (range == "latest") return true;
    if (!validRange(range)) {
      throw new Error("Invalid Range Specified");
    }
    return satisfies(this.version, range);
  }
}
