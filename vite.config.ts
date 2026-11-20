import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Empty prefix also lets Vercel's system variables (VERCEL_*) through.
  const env = loadEnv(mode, '.', '')

  // Crawlers need absolute URLs, so resolve the deploying host at build time.
  const siteUrl = (
    env.VITE_SITE_URL ??
    (env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`
      : env.VERCEL_URL
        ? `https://${env.VERCEL_URL}`
        : '')
  ).replace(/\/+$/, '')

  const socialPreview: Plugin = {
    name: 'ssc-social-preview',
    transformIndexHtml(html) {
      return html
        .replaceAll('__SITE_URL__', siteUrl)
        .replaceAll('__OG_IMAGE__', `${siteUrl}/og/ssc-share.jpg`)
    },
  }

  return {
    plugins: [react(), tailwindcss(), socialPreview],
  }
})
