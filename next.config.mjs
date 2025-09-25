/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
   // domains: ['firebasestorage.googleapis.com'], // Ajoutez le domaine de Firebase ici
    remotePatterns: [
      {
        protocol: "https",
        hostname: "replicationaxoria.b-cdn.net",
        pathname: "/**"
      }
    ]

  },
};

export default nextConfig;