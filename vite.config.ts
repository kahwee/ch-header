import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const projectDir = import.meta.dirname
const srcDir = resolve(projectDir, 'src')
const publicDir = resolve(projectDir, 'public')

// Custom plugin to copy manifest.json and other static assets
const copyPlugin = {
  name: 'copy-assets',
  generateBundle() {
    try {
      const distDir = resolve(projectDir, 'dist')
      mkdirSync(distDir, { recursive: true })

      // Read package.json version
      const packageJsonPath = resolve(projectDir, 'package.json')
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      const version = packageJson.version

      // Read manifest.json, update version, and write to dist
      const manifestPath = resolve(srcDir, 'manifest.json')
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
      manifest.version = version

      writeFileSync(resolve(distDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

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
      const from = resolve(projectDir, 'dist/src/ui/popup.html')
      const to = resolve(projectDir, 'dist/ui/popup.html')

      if (existsSync(from)) {
        mkdirSync(resolve(projectDir, 'dist/ui'), { recursive: true })
        renameSync(from, to)

        // Clean up empty src directory if it exists
        const srcPath = resolve(projectDir, 'dist/src')
        try {
          rmSync(srcPath, { recursive: true, force: true })
        } catch (_e) {
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
    outDir: resolve(projectDir, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(projectDir, './src'),
    },
  },
  plugins: [copyPlugin],
})
