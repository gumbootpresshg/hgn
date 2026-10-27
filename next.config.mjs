/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co https://unknownroads.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://earthquake.usgs.gov https://weather.gc.ca https://unknownroads.com",
      "frame-src 'self' https:",
      "upgrade-insecure-requests",
    ].join("; "),
  },
]

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ]
  },
  async redirects() {
    return [
      { source: "/pages/about", destination: "/about", permanent: true },
      { source: "/pages/advertise", destination: "/advertise", permanent: true },
      { source: "/pages/community-standards", destination: "/community-standards", permanent: true },
      { source: "/pages/contact", destination: "/contact", permanent: true },
      { source: "/pages/corrections", destination: "/corrections", permanent: true },
      { source: "/pages/membership", destination: "/membership", permanent: true },
      { source: "/pages/privacy", destination: "/privacy", permanent: true },
      { source: "/pages/subscribe", destination: "/subscribe", permanent: true },
      { source: "/pages/support", destination: "/support", permanent: true },
      { source: "/pages/terms", destination: "/terms", permanent: true },
      { source: "/articles/Mountie%20Minute", destination: "/articles/mountie-minute", permanent: true },
    ]
  },
}

export default nextConfig
