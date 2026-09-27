# things i kept

那些搬了很多次家也没舍得扔的东西。

An interactive digital keepsake box built with HTML, CSS, and vanilla JavaScript. Real tin photography, image uploads, drag, resize, rotate, overlapping layers, and browser-local persistence.

## Run locally

Requires Node.js 22 or later. No dependencies required.

```sh
npm start
```

Open http://127.0.0.1:5173/.

```sh
npm test
npm run build
```

## GitHub Pages

In repository Settings → Pages, select **GitHub Actions** as the source. The included workflow tests, builds, and deploys `dist/` on pushes to `main`.

## Data

Uploaded objects are stored only in localStorage in the current browser. No uploads are sent to a server. Localhost and GitHub Pages have separate storage; existing localhost collections do not automatically migrate.

Assets and provenance are recorded in `assets/SOURCES.md`.
