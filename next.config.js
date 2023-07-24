/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",

  compiler: {
    relay: {
      src: "./",
      language: "typescript",
      artifactDirectory: "./__generated__",
    },
  },

  modularizeImports: {
    "@mui/icons-material/?(((\\w*)?/?)*)": {
      transform: "@mui/icons-material/{{ matches.[1] }}/{{member}}",
    },
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.node/,
      use: "raw-loader",
    });

    return config;
  },
};

module.exports = nextConfig;
