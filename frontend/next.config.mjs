/** @type {import('next').NextConfig} */
const nextConfig = {
    compiler: {
        styledComponents: true,
    },
    transpilePackages: [
        '@react-pdf/renderer',
        '@react-pdf/font',
        '@react-pdf/layout',
        '@react-pdf/svg',
        '@react-pdf/types',
    ],
};

export default nextConfig;
