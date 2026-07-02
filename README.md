# Cartedo landing (Netlify)

Landing UI lives in this repo. Event tracking calls ScaleMargin backend APIs.

## Tracking scripts

- `cartedo-track-config.js` — set `window.CARTEDO_TRACK_API` to your public backend URL (`TRACK_PUBLIC_URL`)
- `cartedo-landing-tracking.js` — pings `/track/open` and `/track/click` on page load / hot button click

`index.html` loads both before `</body>`.

## Backend env (scalemargin `apps/backend/.env`)

- `CARTEDO_LANDING_URL` — this site's Netlify URL
- `TRACK_PUBLIC_URL` — same URL as `CARTEDO_TRACK_API` above

## Local tunnel

From scalemargin: `apps/backend/scripts/start-cartedo-tunnel.sh` — copy the `trycloudflare.com` URL into both places.
