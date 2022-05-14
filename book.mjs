import pkg from "./package.json";

export const config = {
  // Documentation for Pecans is stored under "docs"
  root: "./docs",
  title: "Pecans Documentation",

  // Enforce use of GitBook v3
  gitbook: ">=3.0.0-pre.0",

  // Use the "official" theme
  plugins: ["theme-official", "sitemap"],
  theme: "official",

  variables: {
    version: pkg.version,
  },

  pluginsConfig: {
    sitemap: {
      hostname: "https://pecans.darrelopry.com/",
    },
  },
};
