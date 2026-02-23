/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  }
}

// If your monorepo/workspace contains multiple package roots (lockfiles),
// Turbopack may infer the wrong workspace root. Setting `turbopack.root`
// ensures Next/Turbopack uses the `frontend` folder as the workspace root
// for the dev server. Adjust the relative path if you prefer a different root.
nextConfig.turbopack = {
  root: './frontend',
}

export default nextConfig
