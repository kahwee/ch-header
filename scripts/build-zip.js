#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const dist = resolve(root, 'dist')
const { name, version } = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const manifest = JSON.parse(readFileSync(resolve(dist, 'manifest.json'), 'utf8'))
if (manifest.version !== version) throw new Error('Stale build: run pnpm build first')
for (const file of [
  manifest.action.default_popup,
  manifest.background.service_worker,
  ...Object.values(manifest.icons),
]) {
  if (!existsSync(resolve(dist, file))) throw new Error(`Missing extension file: ${file}`)
}
const filename = `${name}-${version}.zip`
const archive = resolve(dist, filename)
rmSync(archive, { force: true })
execFileSync('zip', ['-qr', filename, '.', '-x', '*.zip', '*.sha256', '*.DS_Store'], {
  cwd: dist,
  stdio: 'inherit',
})
const hash = createHash('sha256').update(readFileSync(archive)).digest('hex')
writeFileSync(`${archive}.sha256`, `${hash}  ${filename}\n`)
console.log(`Created ${archive} and SHA-256 checksum`)
