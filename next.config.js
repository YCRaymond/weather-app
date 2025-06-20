/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // node-ical 使用了一些 Node.js 內建模組，需要提供 polyfills
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        "node:fs": false,
        "node:net": false,
        "node:tls": false,
        "node:http": false,
        "node:https": false,
        "node:stream": require.resolve('stream-browserify'),
        "node:buffer": require.resolve('buffer/'),
        "node:util": false,
        "node:url": false,
        "node:zlib": false,
        "node:path": false,
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
      };

      config.plugins.push(
        new config.webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }

    return config;
  },
};

module.exports = nextConfig;
