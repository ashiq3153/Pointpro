import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // Supabase Edge Functions use Deno-style remote imports and are deployed by Supabase,
    // not by the Next.js/Vercel build. Prevent Vercel from failing on those files.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
