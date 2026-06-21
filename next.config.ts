import type { NextConfig } from "next";
import { execSync } from "node:child_process";

function getDataUpdatedAt(): string {
  try {
    return execSync("git log -1 --format=%aI -- data/", { encoding: "utf-8" }).trim();
  } catch {
    return new Date().toISOString();
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_DATA_UPDATED_AT: getDataUpdatedAt(),
  },
};

export default nextConfig;
