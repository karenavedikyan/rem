# Stitch Project: Partner Dashboard & Profile

## Project details

- **Title:** Partner Dashboard & Profile
- **Project ID:** `592522453170640283`
- **Screen:** RemCard Landing Page
- **Screen ID:** `83bdf605651146d087e9123f38de610f`

## Usage

Download images using the script (uses `curl -L` to follow redirects):

```bash
./download-stitch.sh
```

Or with a custom base URL:

```bash
./download-stitch.sh https://your-stitch-api.example.com
```

If you have a direct hosted URL for the screen image:

```bash
curl -L -o stitch-assets/Partner-Dashboard-RemCard/remcard-landing/remcard-landing.png "YOUR_HOSTED_IMAGE_URL"
```

## URL patterns attempted

The script tries common Stitch API patterns:

- `{base}/v1/projects/{project_id}/screens/{screen_id}/export/image`
- `{base}/v1/projects/{project_id}/screens/{screen_id}/image`
- `{base}/projects/{project_id}/screens/{screen_id}/image.png`
- `https://assets.stitch.design/{project_id}/{screen_id}.png`
- `https://cdn.stitch.design/projects/{project_id}/screens/{screen_id}.png`

## Output

```
stitch-assets/
├── Partner-Dashboard-RemCard/
│   └── remcard-landing/
│       ├── remcard-landing.png    # screen image (when Stitch is reachable)
│       └── code-reference/
│           └── index.html        # full RemCard Landing Page code
├── download-stitch.sh
└── README.md
```

## Code reference

The `code-reference/index.html` file contains the full RemCard Landing Page markup, matching screen ID `83bdf605651146d087e9123f38de610f`. Paths are relative to the project root.

## Status

If you see HTTP 522 from `stitch.design`, the origin server is unreachable. Retry when the Stitch service is available.
