const { NormalModuleReplacementPlugin } = require("webpack")

/** @type {import('next').NextConfig} */
const nextConfig = {
  staticPageGenerationTimeout: 600,
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding")
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    }
    config.plugins.push(
      new NormalModuleReplacementPlugin(/node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, "")
      })
    )
    return config
  },
}

module.exports = nextConfig
