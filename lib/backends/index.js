import { GitHubBackend } from "./github.js";
const BACKENDS = {
  github: GitHubBackend,
};

export default function (backend) {
  if (typeof backend === "string") return BACKENDS[backend];
  return backend;
}
