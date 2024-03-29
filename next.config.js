/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = {
    images: {
        domains: [
            "uploadthing.com",
            "images.unsplash.com",
            "i1.ytimg.com",
            "utfs.io",
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
