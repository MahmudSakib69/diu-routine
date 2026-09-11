import type { NextConfig } from "next";

// GitHub Pages serves a project site from /<repo>, so every asset and link has
// to be prefixed. Set BASE_PATH in the deploy workflow; empty for local dev and
// for a custom domain.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_REPO_URL: process.env.NEXT_PUBLIC_REPO_URL ?? "" },
};

export default nextConfig;
