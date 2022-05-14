import { PecansRelease } from "./PecansRelease";

export interface PecansChannel {
  name: string;
  latest: string;
  versions_count: number;
  published_at: Date;
  releases: PecansRelease[];
  latest_release: PecansRelease;
}
