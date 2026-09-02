/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/api/requests/**": ["./config/quote-prompt.md"],
      "/r/**": ["./config/quote-prompt.md"],
    },
    serverActions: {
      // Up to 5 photos per intake submission.
      bodySizeLimit: "20mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
