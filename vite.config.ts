import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Crawlers need absolute URLs, so resolve the deploying host at build time.
const siteUrl = (
  process.env.VITE_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : '')
).replace(/\/+$/, '')

function socialPreview(): Plugin {
  return {
    name: 'ssc-social-preview',
    transformIndexHtml(html) {
      return html
        .replaceAll('__SITE_URL__', siteUrl)
        .replaceAll('__OG_IMAGE__', `${siteUrl}/og/ssc-share.jpg`)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), socialPreview()],
})
