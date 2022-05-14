import { sortRelaseBySemVerDescending } from "../utils";
import { PecansChannel } from "./PecansChannel";
import { PecansRelease } from "./PecansRelease";
import { PecansReleaseQuery } from "./PecansReleaseQuery";

export class PecansReleases {
  protected idxReleaseByChannel: Record<string, PecansRelease[]> = {};
  protected idxChannelByName: Record<string, PecansChannel> = {};
  protected channels: PecansChannel[] = [];
  protected releases: PecansRelease[] = [];

  constructor(releases: PecansRelease[]) {
    this.releases = releases.sort(sortRelaseBySemVerDescending);
    releases.forEach((release) => {
      if (!this.idxReleaseByChannel[release.channel]) {
        this.idxReleaseByChannel[release.channel] = [release];
      } else {
        this.idxReleaseByChannel[release.channel].push(release);
      }
    });
    this.getChannelNames().forEach((key) => {
      const version_count = this.idxReleaseByChannel[key].length;
      const latest = this.idxReleaseByChannel[key].reduce((latest, item) => {
        return item.published_at > latest.published_at ? item : latest;
      });
      const channel: PecansChannel = {
        name: key,
        latest: latest.version,
        versions_count: version_count,
        published_at: latest.published_at,
        latest_release: latest,
        releases: this.idxReleaseByChannel[key],
      };
      this.idxChannelByName[key] = channel;
      this.channels.push(channel);
    });
  }

  getChannelNames(): string[] {
    return Object.keys(this.idxReleaseByChannel);
  }

  getChannel(name: string) {
    return this.idxChannelByName[name];
  }

  getChannels() {
    return this.channels;
  }

  getReleases() {
    return this.releases;
  }

  queryReleases(query: PecansReleaseQuery): PecansRelease[] {
    return this.releases.filter((release) => release.satisfiesQuery(query));
  }
}
