const fs = require('fs')
const path = require('path')

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'dist', 'icons')
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// Minimal PNG file (1x1 purple pixel)
// This is a valid PNG but we'll create slightly larger ones
function createPNG(width, height, r, g, b) {
  const canvas = Buffer.alloc(width * height * 4)
  for (let i = 0; i < canvas.length; i += 4) {
    canvas[i] = r // R
    canvas[i + 1] = g // G
    canvas[i + 2] = b // B
    canvas[i + 3] = 255 // A
  }

  // Simple PNG structure for solid color
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR chunk (width, height, bit depth, color type, etc)
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type RGB
  ihdr[10] = 0 // compression
  ihdr[11] = 0 // filter
  ihdr[12] = 0 // interlace

  const crc32 = (buf) => {
    let crc = 0xffffffff
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i]
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
      }
    }
    return (crc ^ 0xffffffff) >>> 0
  }

  // Create a simpler approach: use zlib to compress
  const zlib = require('zlib')

  // Create image data with filter bytes
  const imageData = Buffer.alloc(height * (1 + width * 3))
  for (let y = 0; y < height; y++) {
    imageData[y * (1 + width * 3)] = 0 // filter type none
    for (let x = 0; x < width; x++) {
      const offset = y * (1 + width * 3) + 1 + x * 3
      imageData[offset] = r
      imageData[offset + 1] = g
      imageData[offset + 2] = b
    }
  }

  const compressed = zlib.deflateSync(imageData)

  const png = Buffer.concat([signature])

  // IHDR chunk
  const ihdrChunk = Buffer.concat([
    Buffer.from([0, 0, 0, 13]), // length
    Buffer.from('IHDR'),
    ihdr,
    Buffer.from(
      crc32(Buffer.concat([Buffer.from('IHDR'), ihdr]))
        .toString(16)
        .padStart(8, '0'),
      'hex'
    ),
  ])

  // IDAT chunk
  const idatChunk = Buffer.concat([Buffer.alloc(4), Buffer.from('IDAT'), compressed])
  idatChunk.writeUInt32BE(compressed.length, 0)
  idatChunk.writeUInt32BE(
    crc32(Buffer.concat([Buffer.from('IDAT'), compressed])),
    compressed.length + 4 + 4
  )

  // IEND chunk
  const iendChunk = Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130])

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk])
}

// Create icons with purple color (#6b4eff)
const colors = { r: 107, g: 78, b: 255 }

try {
  // 16x16
  const icon16 = createPNG(16, 16, colors.r, colors.g, colors.b)
  fs.writeFileSync(path.join(iconsDir, '16.png'), icon16)
  console.log('✓ Created 16.png')

  // 48x48
  const icon48 = createPNG(48, 48, colors.r, colors.g, colors.b)
  fs.writeFileSync(path.join(iconsDir, '48.png'), icon48)
  console.log('✓ Created 48.png')

  // 128x128
  const icon128 = createPNG(128, 128, colors.r, colors.g, colors.b)
  fs.writeFileSync(path.join(iconsDir, '128.png'), icon128)
  console.log('✓ Created 128.png')

  console.log('✓ All icons generated successfully!')
} catch (err) {
  console.error('Error generating icons:', err)
  process.exit(1)
}
