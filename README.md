# Àlex Rodríguez Benítez — 3D Interactive Portfolio

An interactive 3D portfolio built as a Blender-designed room rendered in the browser. Instead of a traditional webpage, visitors explore a virtual room and click on objects to discover content.

## Features

- **3D Room** — Fully modelled in Blender, rendered in real time with Three.js and WebGL
- **Interactive objects** — Click on items in the room to trigger animated camera fly-tos and UI panels:
  - **Bookshelf** → Education & work experience, browsable as physical books
  - **Monitor** → A fake desktop with three apps:
    - *Bloom* — A fictional flower shop backed by a real REST API + SQLite database
    - *Projects* — Portfolio projects displayed in a VS Code-style explorer
    - *About.pdf* — CV rendered as a PDF viewer
  - **Vase** → Live feed of everyone who has "bought" a flower in the Bloom shop
- **Smooth camera animations** — GSAP-powered fly-to transitions between views
- **Multilingual** — English, Spanish and Catalan (auto-detected from browser)
- **Custom animated cursor** — Respects `prefers-reduced-motion`
- **Fully responsive** — Adapted FOV and camera position for mobile

## Tech stack

| Layer | Technology |
|---|---|
| 3D rendering | Three.js · @react-three/fiber · @react-three/drei |
| UI framework | React 19 · Vite |
| Animations | GSAP |
| Styling | Tailwind CSS v4 |
| Internationalisation | i18next · react-i18next |
| API | Node.js · Express |
| Database | better-sqlite3 (SQLite) |
| Security | helmet · express-rate-limit · bad-words |
| Deployment | Docker · nginx-proxy · acme-companion (Let's Encrypt) |

## Local development

**Prerequisites:** Node.js 20+, pnpm

```bash
# Install frontend dependencies
pnpm install

# Start the frontend dev server (localhost:5173)
pnpm dev
```

To also run the Bloom API:

```bash
cd server
npm install
node index.js   # listens on localhost:3001
```

The Vite dev server automatically proxies `/api` requests to `localhost:3001`.

## Project structure

```
portfolio-3d/
├── public/
│   ├── room.glb              # Blender-exported 3D scene
│   └── img/                  # Profile photo and certificate PDFs
├── src/
│   ├── components/
│   │   ├── Scene.jsx         # Three.js canvas, camera controller, click handlers
│   │   ├── BooksPanel.jsx    # Education & experience shelf UI
│   │   ├── MonitorPanel.jsx  # Desktop UI with Bloom, Projects and About apps
│   │   ├── VasePanel.jsx     # Live Bloom purchase feed
│   │   ├── CustomCursor.jsx  # Animated cursor with RAF loop
│   │   ├── LanguageSwitcher.jsx
│   │   └── ErrorBoundary.jsx
│   ├── locales/
│   │   ├── en.json
│   │   ├── es.json
│   │   └── ca.json
│   ├── App.jsx               # Root component, panel state management
│   └── i18n.js               # i18next configuration
├── server/
│   ├── index.js              # Express API (flowers endpoints)
│   └── package.json
├── Dockerfile.frontend       # Multi-stage build: pnpm build → nginx:alpine
├── Dockerfile.backend        # Multi-stage build: compiles better-sqlite3 → node:alpine
├── docker-compose.yml        # Production setup for nginx-proxy + acme-companion
└── nginx.conf                # Nginx config inside the frontend container
```

## Environment variables

The API server reads the following at startup:

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | Set to `production` to disable wildcard CORS |
| `PORT` | `3001` | Port the Express server listens on |
| `DB_PATH` | `./flowers.db` | Path to the SQLite database file |

## Deployment

The project is designed to run alongside an [nginx-proxy](https://github.com/nginx-proxy/nginx-proxy) + [acme-companion](https://github.com/nginx-proxy/acme-companion) stack, which handles reverse proxying and automatic Let's Encrypt certificates.

```bash
# On the server
git clone https://github.com/YOUR_USER/YOUR_REPO /srv/portfolio
cd /srv/portfolio
docker compose up -d --build
```

SSL is provisioned automatically by acme-companion once a DNS A record pointing to the server is in place.

## Blender → Three.js pipeline

The room is exported from Blender as a single `.glb` file and loaded with `useGLTF`. Object names in Blender become keys in the `nodes` map. Clickable objects are identified by mesh name or material name prefix — see `Scene.jsx` for the detection helpers (`isBookMesh`, `isMonitorMesh`, `isVaseMesh`).

## License

MIT
