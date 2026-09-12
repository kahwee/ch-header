# ChHeader identity

ChHeader’s mascot is a curious blue gecko with cream eyes and tiny toe pads.
Use the approved [mascot](../../public/icons/gecko.png) for large artwork and
[logo.png](../../public/icons/logo.png) in the popup. Chrome uses the PNG exports
at 16, 32, 48 and 128 pixels. Keep the mascot’s proportions and transparent background.

Keep `public/icons/gecko.png` as the source artwork. The README, blog post,
Chrome icons and video use this same mascot. Pair prominent artwork with
“ChHeader” and “By KahWee Teng”; keep the writing direct and personal.

The mascot was generated with ChatGPT’s image generator and selected by KahWee Teng.
Blue remains the interface accent. Profile colors are independent of the brand;
the popup follows system light and dark appearance.

Regenerate the size exports with ImageMagick:

```sh
magick public/icons/gecko.png -resize 256x256 public/icons/logo.png
for size in 16 32 48 128; do
  magick public/icons/gecko.png -resize "${size}x${size}" "public/icons/${size}.png"
done
```
