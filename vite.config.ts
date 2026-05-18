import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Plugin to resolve figma:asset/ imports as placeholder images for local dev
function figmaAssetPlugin() {
  const prefix = 'figma:asset/'
  const resolvedPrefix = '\0figma-asset:'
  return {
    name: 'figma-asset-placeholder',
    resolveId(id: string) {
      if (id.startsWith(prefix)) {
        return resolvedPrefix + id.slice(prefix.length)
      }
    },
    load(id: string) {
      if (id.startsWith(resolvedPrefix)) {
        // Return a 1x1 transparent PNG as a data URL
        return `export default "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg=="`
      }
    },
  }
}

// On GitHub Pages the site is served from /<repo>/, locally from /
const isCI = process.env.GITHUB_ACTIONS === "true";

export default defineConfig({
  base: isCI ? "/Ehpvetcare/" : "/",
  plugins: [
    figmaAssetPlugin(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
