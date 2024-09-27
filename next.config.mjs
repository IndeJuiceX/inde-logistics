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
};

export default nextConfig;
