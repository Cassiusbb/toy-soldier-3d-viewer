# toy-soldier-3d-viewer

Standalone low-poly 3D toy soldier viewer built with CDN-loaded Three.js (no build step).

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

Loaded directly in `app.js`:

- `three.module.js` from jsDelivr (`three@0.170.0`)
- `OrbitControls.js` from jsDelivr (`three@0.170.0` examples)

## Graceful fallback

If WebGL is unavailable, the viewer hides the canvas and shows a clear fallback message in the UI.
