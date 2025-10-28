import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, renameSync, rmSync, cpSync } from 'fs'

const srcDir = resolve(__dirname, 'src')
const publicDir = resolve(__dirname, 'public')

// Custom plugin to copy manifest.json and other static assets
const copyPlugin = {
  name: 'copy-assets',
  generateBundle() {
    try {
      const distDir = resolve(__dirname, 'dist')
      mkdirSync(distDir, { recursive: true })
      copyFileSync(resolve(srcDir, 'manifest.json'), resolve(distDir, 'manifest.json'))

      // Copy icons from public folder
      const publicIconsDir = resolve(publicDir, 'icons')
      const distIconsDir = resolve(distDir, 'icons')
      if (existsSync(publicIconsDir)) {
        mkdirSync(distIconsDir, { recursive: true })
        cpSync(publicIconsDir, distIconsDir, { recursive: true, force: true })
      }
    } catch (e) {
      console.warn('Could not copy assets:', e)
    }
  },
  writeBundle() {
    // Move src/ui/popup.html to ui/popup.html
    try {
      const from = resolve(__dirname, 'dist/src/ui/popup.html')
      const to = resolve(__dirname, 'dist/ui/popup.html')

      if (existsSync(from)) {
        mkdirSync(resolve(__dirname, 'dist/ui'), { recursive: true })
        renameSync(from, to)

        // Clean up empty src directory if it exists
        const srcPath = resolve(__dirname, 'dist/src')
        try {
          rmSync(srcPath, { recursive: true, force: true })
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    } catch (e) {
      console.warn('Could not move popup.html:', e)
    }
  },
}

export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
    rollupOptions: {
      input: {
        popup: resolve(srcDir, 'ui', 'popup.html'),
        background: resolve(srcDir, 'background.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background/[name].js'
          }
          return 'popup/[name].js'
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [copyPlugin],
})
