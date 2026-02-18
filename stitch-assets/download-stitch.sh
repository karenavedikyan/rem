#!/usr/bin/env bash
# Download images and code for Stitch project: Partner Dashboard & Profile
# Project ID: 592522453170640283
# Screen: RemCard Landing Page, ID: 83bdf605651146d087e9123f38de610f
#
# Usage: ./download-stitch.sh [base_url]
# Uses curl -L to follow redirects when downloading hosted URLs.

set -e
PROJECT_ID="592522453170640283"
SCREEN_ID="83bdf605651146d087e9123f38de610f"
OUTDIR="$(dirname "$0")/Partner-Dashboard-RemCard/remcard-landing"
IMGFILE="$OUTDIR/remcard-landing.png"
mkdir -p "$OUTDIR"

BASE="${1:-https://api.stitch.design}"
echo "Downloading Stitch project $PROJECT_ID, screen $SCREEN_ID"
echo "Base URL: $BASE"
echo "Output: $OUTDIR"
echo ""

# URL patterns to try for images/export (curl -L follows redirects)
URLS=(
  "${BASE}/v1/projects/${PROJECT_ID}/screens/${SCREEN_ID}/export/image"
  "${BASE}/v1/projects/${PROJECT_ID}/screens/${SCREEN_ID}/image"
  "${BASE}/projects/${PROJECT_ID}/screens/${SCREEN_ID}/image.png"
  "${BASE}/api/projects/${PROJECT_ID}/screens/${SCREEN_ID}"
  "https://assets.stitch.design/${PROJECT_ID}/${SCREEN_ID}.png"
  "https://cdn.stitch.design/projects/${PROJECT_ID}/screens/${SCREEN_ID}.png"
)

SUCCESS=0
for url in "${URLS[@]}"; do
  echo "Trying: $url"
  if curl -sL -f --connect-timeout 10 -o "$IMGFILE" "$url" 2>/dev/null; then
    if file "$IMGFILE" | grep -qE 'image|PNG|JPEG'; then
      echo "  -> Success (image saved)"
      SUCCESS=1
      break
    fi
    rm -f "$IMGFILE"
  fi
  echo "  -> Failed or not an image"
done

if [ "$SUCCESS" -eq 0 ]; then
  echo ""
  echo "No image downloaded. If stitch.design returns 522, the origin may be unreachable."
fi
echo ""
echo "Done. Check $OUTDIR for downloaded files."
