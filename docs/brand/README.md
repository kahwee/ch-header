# ChHeader identity

Keep the recognizable product name. The mark shows three header rows with movable
controls: it reads as a small editing tool even at toolbar size.

Source artwork: [logo.svg](../../public/icons/logo.svg). The SVG is original vector
artwork, with PNG exports at 16, 32, 48 and 128 pixels for Chrome.

| Role               | Color     |
| ------------------ | --------- |
| Canvas / ink       | `#202124` |
| Sidebar and fields | `#292a2d` |
| Raised surface     | `#303238` |
| Primary text       | `#e8eaed` |
| Secondary text     | `#bdc1c6` |
| Accent / logo      | `#a8c7fa` |

Use system UI fonts, restrained borders, compact spacing, and pill-shaped primary
actions. Profile colors are personal markers; they do not replace the blue brand
accent. The interface currently has a dark theme and does not follow Chrome's
custom theme colors automatically.

Regenerate icons with ImageMagick:

```sh
for size in 16 32 48 128; do
  magick -background none public/icons/logo.svg -resize "${size}x${size}" "public/icons/${size}.png"
done
```
