# toy-soldier-3d-viewer

Standalone low-poly 3D toy soldier viewer built with CDN-loaded Three.js (no build step).

## Public preview URL

After GitHub Pages runs successfully on `main`, the site is available at:

- https://cassiusbb.github.io/toy-soldier-3d-viewer/

If this is the first Pages deploy, enable **Settings → Pages → Build and deployment → Source: GitHub Actions** in this repository.

## Run locally

Because this project uses JavaScript modules, serve it from any static server in the repository root:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

## Deploy / host

This is a static site with `index.html` as the entry point, so it can be hosted directly on:

- GitHub Pages
- Netlify
- Vercel static hosting
- Any static web server

No server-side code or bundler is required.

## Viewer controls

- **Orbit controls:**
  - Left mouse / one-finger drag: rotate
  - Right mouse / two-finger drag: pan
  - Scroll / pinch: zoom
- **Animation selector:** March, Wave, Idle
- **Play/Pause:** toggles animation playback
- **Reset Camera:** restores the default viewpoint
- **Auto-rotate:** spins camera around model
- **Soldier Color:** swaps palette themes

## CDN dependencies

Loaded via import map in `index.html`:

- `three.module.js` from jsDelivr (`three@0.170.0`)
- `OrbitControls.js` from `three` examples (`three@0.170.0`) through the `three/addons/` import-map alias

## Graceful fallback

If WebGL or viewer module loading fails, the viewer hides the canvas and shows a clear diagnostic message in the UI.
