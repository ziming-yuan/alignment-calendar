/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = {
    images: {
        // Serve original images without depending on Vercel's paid optimizer.
        unoptimized: true,
        domains: [
            "uploadthing.com",
            "images.unsplash.com",
            "i1.ytimg.com",
            "utfs.io",
        ],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "uj3l1parvf.ufs.sh",
                pathname: "/f/**",
            },
        ],
    },
    experimental: {
        serverActions: true,
    },
    webpack: (config) => {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"],
        });
        return config;
    },
};
