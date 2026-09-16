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

const scenes = [
  {
    source: join(root, 'public', 'icons', 'gecko.png'),
    title: 'ChHeader',
    caption: 'Scoped HTTP header editing without ads.',
    duration: 5,
    mascot: true,
  },
  {
    source: join(screenshots, 'access-needed.jpg'),
    title: '1 / Choose a narrow website scope',
    caption: 'The profile cannot run until Chrome access is approved.',
    duration: 7,
  },
  {
    source: join(screenshots, 'access-approved.jpg'),
    title: '2 / Approve access before enabling',
    caption: 'Approval and activation are separate decisions.',
    duration: 7,
  },
  {
    source: join(screenshots, 'popup.jpg'),
    title: '3 / Turn on the profile',
    caption: 'Only saved rules for approved destinations become active.',
    duration: 7,
  },
  {
    source: join(screenshots, 'header-check.jpg'),
    title: '4 / Verify a real Chrome request',
    caption: 'The localhost server received X-ChHeader-Demo: hello-gecko.',
    duration: 8,
  },
  {
    source: join(screenshots, 'access-revoked.jpg'),
    title: '5 / Switch off and revoke access',
    caption: 'Cleanup leaves every profile off and removes website access.',
    duration: 7,
  },
  {
    source: join(root, 'public', 'icons', 'gecko.png'),
    title: 'Use it, review it, or build your own',
    caption: 'github.com/kahwee/ch-header',
    duration: 5,
    mascot: true,
  },
]

for (const [index, scene] of scenes.entries()) {
  const content = join(output, `content-${index}.png`)
  const frame = join(output, `frame-${index}.png`)
  run('magick', [scene.source, '-resize', scene.mascot ? '330x330' : '1500x720>', content])
  const geometry = scene.mascot ? '+795+270' : '+210+230'
  run('magick', [
    '-size',
    '1920x1080',
    'xc:#e8eef8',
    content,
    '-gravity',
    'northwest',
    '-geometry',
    geometry,
    '-composite',
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

writeFileSync(
  join(output, 'youtube-details.txt'),
  `Title: ChHeader: scoped website access and HTTP headers\n\nDescription:\nChHeader edits request and response headers in Chrome using local profiles and explicit per-site access. This walkthrough shows the real unpacked extension and a real localhost request.\n\n00:00 ChHeader\n00:05 Choose a narrow website scope\n00:12 Approve Chrome website access\n00:19 Enable the profile\n00:26 Verify the real request\n00:34 Switch off and revoke access\n00:41 Source and downloads\n\nSource, documentation and downloads: https://github.com/kahwee/ch-header\nWhy I built it: https://kahwee.com/2026/why-i-built-chheader/\nPrivacy: https://github.com/kahwee/ch-header/blob/main/PRIVACY.md\nSupport: https://github.com/kahwee/ch-header/issues\n\nProfiles are stored locally. Header values are sent only to destinations matched by enabled profiles, so review website scope before using credentials. Demo values only; no credentials or external sites are used here.\n\nThis video uses on-screen captions and has no spoken narration.\nAudience: Not made for kids.\nVisibility: Public.\n`
)

console.log(`Created ${join(output, videoFilename)}`)
