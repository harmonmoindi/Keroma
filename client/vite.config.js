import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from "vite-plugin-pwa"; 

// https://vite.dev/config/
export default defineConfig({
  plugins: [
  react(),
  VitePWA({
    registerType: "autoUpdate",
    includeAssets: ["apple-touch-icon.png", "favicon.svg"],
    manifest: {
      name: "Keroma",
      short_name: "Keroma",
      description: "Kenyan Aroma: browse home-cooked Kenyan meals until something looks right.",
      theme_color: "#15110E",
      background_color: "#15110E",
      display: "standalone",
      start_url: "/",
      icons: [
        { src: "icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
  }),
],
})
