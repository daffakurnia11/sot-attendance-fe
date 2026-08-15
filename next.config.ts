import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone with a self-contained server.js and only the
  // node_modules the traced build actually reaches. The production Dockerfile
  // copies that instead of installing dependencies again in the runner stage.
  output: "standalone",
};

export default nextConfig;
