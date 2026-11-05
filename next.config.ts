import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    allowedDevOrigins: ['xtranscendence.ru', 'localhost:3000', 'localhost:80', 'localhost', '192.168.1.*'],
    reactStrictMode: false,
    experimental: {
        serverActions: {
            allowedOrigins: [
                'xtranscendence.ru',
                'localhost:3000',
                'localhost:80',
                '192.168.1.159:3000',
                '192.168.1.*:3000',
                '192.168.1.159:80',
                '192.168.1.*:80',
                '192.168.1.174:3000',
                '192.168.1.*:3000',
                '192.168.1.174:80',
                '192.168.1.*:80'
            ]
        }
    },
    devIndicators: false,
    poweredByHeader: false,
    trailingSlash: true,
    /*async redirects() {
        return [
            {
                source: '/mongo',
                destination: '/',
                permanent: true
            }
        ];
    },*/
    turbopack: {
        rules: {
            '*.{glsl,wgsl,vs,fs,vert,frag}': {
                loaders: ['raw-loader'],
                as: '*.js'
            }
        }
    }
};

export default nextConfig;
