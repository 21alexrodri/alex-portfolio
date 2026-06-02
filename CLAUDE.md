# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `portfolio-3d/`:

```bash
npm run dev      # Start dev server (Vite, localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build locally
npm run lint     # ESLint
```

## Project Goal

An interactive 3D portfolio built as a Blender-designed room rendered in the browser. The user clicks on objects in the room (computer, bookshelf, etc.) to trigger camera animations and UI panels showing portfolio content.

## Stack

- **React 19 + Vite** — app shell and UI overlays
- **Three.js + @react-three/fiber** — 3D rendering inside a `<Canvas>`
- **@react-three/drei** — helpers: `useGLTF`, `OrbitControls`, etc.
- **GSAP** — camera fly-to animations on click
- **Tailwind CSS v4** — styling for HTML overlay panels

## Architecture

The 3D scene lives entirely inside `src/components/Scene.jsx`, rendered via a single `<Canvas>` that fills the viewport. HTML overlay panels (projects, skills, etc.) sit on top of the canvas as normal React components in `App.jsx`, shown/hidden based on state.

**Data flow:**
1. `useGLTF('/room.glb')` loads the Blender export from `public/`
2. Individual mesh nodes are accessed by name (as exported from Blender) via the `nodes` map returned by `useGLTF`
3. `onClick` handlers on those meshes trigger GSAP camera animations and lift state up to `App.jsx` to show the relevant overlay panel
4. GSAP animates `camera.position` and `camera.lookAt` target for fly-to transitions

**Blender → Three.js pipeline:**
- Export from Blender as **GLB** (single binary file) into `public/room.glb`
- Object names in Blender become `nodes['name']` keys in `useGLTF`
- Give clickable objects clear names in Blender before exporting (e.g. `computer`, `bookshelf`, `door`)

## Key conventions

- The canvas must be `width: 100vw; height: 100vh` with `margin: 0` on body — `index.css` currently adds flex centering that needs to be overridden.
- R3F click events bubble through the scene graph; call `e.stopPropagation()` on mesh handlers to avoid double-firing on parent groups.
- GSAP camera animations should target the Three.js camera object obtained via `useThree(({ camera }) => camera)`.

## room.glb — Mapa de meshes y materiales

Identificados confirmando en el browser. Usar esta tabla para añadir interacciones o efectos sin tener que hacer debug por prueba y error.

| Mesh(es) | Materiales | Objeto |
|---|---|---|
| `Suelo` | `Material.002` | Suelo |
| `Plane002`, `Plane002_1` | `Material.003/004` | Paredes |
| `Cube008_*` (5 partes) | `Material.001/005/007/008` | Cama |
| `Cube015_*` (3 partes) | `Material.009/010` | Mesa de escritorio |
| `Cube023_0–3` | `Material.012/013/014` | Pantalla del monitor |
| `Cube023_4–16` | `PC_Body`, `PC_*` | Torre del PC |
| `Cube006_*` | `Material.019/020` + sin nombre | Silla |
| `Cube018`, `Cube018_1` | sin nombre, `Material` | Librería (estantería) |
| `Cube032_*` | `Mat_Mesita`, `Mat_Mesita_Top`, `Mat_Tirador` | Mesita de noche |
| `Cylinder_*` | `Mat_LampBase`, `Mat_Lampara_Shade` | Lámpara |
| `Cylinder009_*` | `Mat_Taza` | Taza |
| `Cafe` | `Mat_Cafe` | Café |
| `Torus`, `Torus_1` | `Mat_Gold`, `Mat_Jarron` | Jarrón |
| `bsep_Bud_3_0_*` | `MSepal/Stem/Leaf/MRed/MPink/MWhite/MBud` | Flores del jarrón |
| `Cube131_*` (60 partes) | `Mat_Libro_*`, `Mat_Paginas` | Libros del estante |
| `Cube064_*` | `KB_Key/Body/LED/Space` | Teclado |
| `Raton` | `Mouse_B` | Ratón |

# Important Notes
- Always update this file with any new architectural decisions or conventions to keep it current for future developers.
- When adding new 3D assets, ensure they are optimized for web (low poly, compressed textures) to maintain performance.
- For complex animations, consider using GSAP timelines for better control and sequencing.
