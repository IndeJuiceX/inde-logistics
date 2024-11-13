/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {

        /* Images are being loaded from these domains */
        // domains: [{'indecdn.com', 'indejuice.com', 'images.indejuice.com', 'cdn.indejuice.com'}],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.indejuice.com',
            },
            {
                protocol: 'https',
                hostname: 'example.com',
            },
        ],
    },
    env: {
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_REGION: process.env.AWS_REGION,
        APP_ENV: process.env.APP_ENV
    },
};

export default nextConfig;
