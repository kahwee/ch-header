import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const output = join(root, '.local', 'qa', 'video-latest')
const screenshots = join(root, 'docs', 'screenshots')
const font = '/System/Library/Fonts/Supplemental/Arial.ttf'
const bold = '/System/Library/Fonts/Supplemental/Arial Bold.ttf'
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const videoFilename = `chheader-demo-${version}.mp4`

mkdirSync(output, { recursive: true })

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' })
  if (result.status !== 0) {
    throw new Error(`${command} failed: ${result.stderr || result.stdout}`)
  }
}

function timestamp(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `00:${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')},000`
}

const storeUrl =
  'https://chromewebstore.google.com/detail/chheader/okmjidkmnlobbppegojfcedhaakadgig'
const scenes = [
  {
    source: join(screenshots, 'popup.jpg'),
    title: 'Your test headers. Your chosen sites.',
    caption: 'Edit HTTP headers in Chrome. No ads, analytics, or account.',
    duration: 5,
  },
  {
    source: join(screenshots, 'header-check.jpg'),
    title: 'See the header arrive',
    caption: 'A real localhost request received X-ChHeader-Demo: hello-gecko.',
    duration: 6,
  },
  {
    source: join(screenshots, 'access-needed.jpg'),
    title: '1 / Choose the site you want to test',
    caption: 'Save a hostname, then approve Chrome website access.',
    duration: 6,
  },
  {
    source: join(screenshots, 'access-approved.jpg'),
    title: '2 / Add headers and a matching URL rule',
    caption: 'Approved access and an enabled profile are separate controls.',
    duration: 6,
  },
  {
    source: join(screenshots, 'popup.jpg'),
    title: '3 / Enable, reload, and compare',
    caption: 'Reuse named profiles for local development, staging, and debugging.',
    duration: 6,
  },
  {
    source: join(screenshots, 'access-revoked.jpg'),
    title: 'Finish with a clean slate',
    caption: 'Switch off to stop changes. Revoke access to remove site grants.',
    duration: 5,
  },
  {
    source: join(root, 'public', 'icons', 'gecko.png'),
    title: 'ChHeader — HTTP header editor for Chrome',
    caption: 'Install from the Chrome Web Store. Link in the description.',
    duration: 5,
    mascot: true,
  },
]

for (const [index, scene] of scenes.entries()) {
  const content = join(output, `content-${index}.png`)
  const frame = join(output, `frame-${index}.png`)
  run('magick', [scene.source, '-resize', scene.mascot ? '430x430' : '1500x720', content])
  const geometry = scene.mascot ? '+0+0' : '+0+25'
  run('magick', [
    '-size',
    '1920x1080',
    'xc:#e8eef8',
    content,
    '-gravity',
    'center',
    '-geometry',
    geometry,
    '-composite',
    '-gravity',
    'northwest',
    '-font',
    bold,
    '-fill',
    '#202124',
    '-pointsize',
    '48',
    '-annotate',
    '+90+98',
    scene.title,
    '-font',
    font,
    '-fill',
    '#4b5666',
    '-pointsize',
    '28',
    '-annotate',
    '+90+157',
    scene.caption,
    '-pointsize',
    '22',
    '-annotate',
    '+90+1030',
    `ChHeader ${version}  ·  Actual Chrome toolbar and localhost request`,
    '-alpha',
    'off',
    frame,
  ])
}

let elapsed = 0
const captions = scenes
  .map((scene, index) => {
    const start = elapsed
    elapsed += scene.duration
    return `${index + 1}\n${timestamp(start)} --> ${timestamp(elapsed)}\n${scene.title}\n${scene.caption}\n`
  })
  .join('\n')
writeFileSync(join(output, 'captions.srt'), captions)

const concat = scenes
  .map((scene, index) => `file 'frame-${index}.png'\nduration ${scene.duration}`)
  .join('\n')
writeFileSync(join(output, 'concat.txt'), `${concat}\nfile 'frame-${scenes.length - 1}.png'\n`)

run('ffmpeg', [
  '-y',
  '-hide_banner',
  '-loglevel',
  'error',
  '-f',
  'concat',
  '-safe',
  '0',
  '-i',
  join(output, 'concat.txt'),
  '-f',
  'lavfi',
  '-i',
  'anullsrc=channel_layout=stereo:sample_rate=48000',
  '-t',
  String(elapsed),
  '-vf',
  'fps=30,format=yuv420p',
  '-c:v',
  'libx264',
  '-preset',
  'medium',
  '-crf',
  '18',
  '-c:a',
  'aac',
  '-shortest',
  '-movflags',
  '+faststart',
  join(output, videoFilename),
])

run('magick', [
  'montage',
  ...scenes.flatMap((_, index) => [join(output, `frame-${index}.png`)]),
  '-thumbnail',
  '480x270',
  '-font',
  font,
  '-background',
  '#e8eef8',
  '-gravity',
  'center',
  '-tile',
  '2x',
  '-geometry',
  '+8+8',
  join(output, 'contact-sheet.png'),
])

const chapters = scenes.map((scene) => scene.title)
let chapterStart = 0
const chapterText = scenes
  .map((scene, index) => {
    const time = `${String(Math.floor(chapterStart / 60)).padStart(2, '0')}:${String(chapterStart % 60).padStart(2, '0')}`
    chapterStart += scene.duration
    return `${time} ${chapters[index]}`
  })
  .join('\n')
writeFileSync(
  join(output, 'youtube-details.txt'),
  `Title: Edit HTTP headers in Chrome with ChHeader | API testing, no ads\n\nDescription:\nInstall ChHeader: ${storeUrl}\n\nTest APIs and websites with reusable request and response header profiles. ChHeader is an open-source Chrome extension with local storage, optional website access, no ads, and no analytics.\n\nThis captioned walkthrough uses actual Chrome toolbar captures and a verified localhost request from ChHeader ${version}. It has no spoken narration. Demo values only.\n\n${chapterText}\n\nTry the public tester with demo values: https://headers.kahwee.com\nSource and setup: https://github.com/kahwee/ch-header\nPrivacy: https://github.com/kahwee/ch-header/blob/main/PRIVACY.md\nSupport: https://github.com/kahwee/ch-header/issues\n\nHeader values are sent to destinations matched by your enabled rules. Review website scope before using credentials. Local profiles are not encrypted by ChHeader.\n\nAudience: Not made for kids.\nVisibility: Public.\n`
)

console.log(`Created ${join(output, videoFilename)}`)
