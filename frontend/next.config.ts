import type { NextConfig } from "next";

const backendInternalUrl = process.env.BACKEND_INTERNAL_URL?.replace(/\/+$/, "");
const isProductionBuild = process.env.NODE_ENV === "production";
const isVercelPreview = process.env.VERCEL_ENV === "preview";

if (!backendInternalUrl && isProductionBuild && !isVercelPreview) {
    throw new Error("BACKEND_INTERNAL_URL is not configured.");
}

const nextConfig: NextConfig = {
    allowedDevOrigins: ["10.32.1.20"],
    async rewrites() {
        if (!backendInternalUrl) {
            return [];
        }

        return [
            {
                source: "/api/:path*",
                destination: `${backendInternalUrl}/api/:path*`,
            },
            {
                source: "/sanctum/:path*",
                destination: `${backendInternalUrl}/sanctum/:path*`,
            },
        ];
    },
};

export default nextConfig;
