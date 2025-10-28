#!/usr/bin/env node
/**
 * Build script to create ZIP package of Chrome extension
 * Usage: node scripts/build-zip.js
 */

import { execSync } from 'child_process'
import { existsSync, readFileSync, statSync } from 'fs'
import { resolve } from 'path'

const distDir = resolve('./dist')
const packageJsonPath = resolve('./package.json')

// Check if dist folder exists
if (!existsSync(distDir)) {
  console.error('❌ dist/ folder not found. Run `npm run build` first.')
  process.exit(1)
}

// Read package.json to get version and name
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
const { name, version } = packageJson

const zipName = `${name}-${version}.zip`
const distFolder = resolve('./dist')
const zipPath = resolve(distFolder, zipName)

try {
  console.log(`📦 Creating ${zipName}...`)

  // Create ZIP file from dist directory (output to dist folder)
  // Exclude common unwanted files and the zip file itself
  execSync(
    `cd dist && zip -r "${zipName}" . -x "*.DS_Store" ".git/*" "node_modules/*" "*.zip" && cd ..`,
    { stdio: 'inherit' }
  )

  console.log(`✅ Successfully created: ${zipName}`)
  console.log(`📍 Location: ${zipPath}`)
  console.log(`📊 Size: ${getFileSizeString(zipPath)}`)
  console.log()
  console.log('📖 Next steps:')
  console.log('1. Test locally: Load unpacked folder in chrome://extensions/')
  console.log('2. Or upload to Chrome Web Store for distribution')
  console.log()
} catch (err) {
  console.error('❌ Failed to create ZIP file:')
  console.error(err.message)
  process.exit(1)
}

function getFileSizeString(filePath) {
  const stats = statSync(filePath)
  const bytes = stats.size
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
