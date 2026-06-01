import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";
const owner = process.env.GITHUB_REPOSITORY_OWNER || "";
const isUserOrOrgSiteRepo =
  Boolean(repository) &&
  Boolean(owner) &&
  repository.toLowerCase() === `${owner.toLowerCase()}.github.io`;

const base = process.env.SITE_BASE || (repository && !isUserOrOrgSiteRepo ? `/${repository}/` : "/");
const site = process.env.SITE_URL || (owner ? `https://${owner}.github.io` : "https://example.github.io");

export default defineConfig({
  site,
  base,
  output: "static",
  trailingSlash: "always",
  integrations: [sitemap()],
});
