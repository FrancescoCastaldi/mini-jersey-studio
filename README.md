# MiniJersey 3D Studio 🚴‍♂️✨

<div align="center">

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=for-the-badge&logo=github)](https://francescocastaldi.github.io/mini-jersey-studio/)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20Bundler-orange?style=for-the-badge)](#architecture)
[![Client Side](https://img.shields.io/badge/Execution-100%25%20Client--Side-purple?style=for-the-badge)](#key-features)

**A professional, fully client-side 3D cycling jersey and apparel customizer with real-time dynamic planar UV texture mapping, custom GLB model import, and manufacturing Tech Pack generation.**

[Explore Live Demo](https://francescocastaldi.github.io/mini-jersey-studio/) · [Report Bug](https://github.com/FrancescoCastaldi/mini-jersey-studio/issues) · [Request Feature](https://github.com/FrancescoCastaldi/mini-jersey-studio/issues)

</div>

---

## 🌟 Overview

**MiniJersey 3D Studio** bridges the gap between 2D vector apparel design and real-time 3D WebGL visualization. Designed for cycling teams, designers, and manufacturers, it allows users to design high-performance cycling jerseys with instant visual feedback and generate production-ready manufacturing blueprints directly in the browser.

Operating **100% client-side**, the entire engine requires no backend server, database, or build pipeline. It runs seamlessly when hosted on static CDN platforms (like GitHub Pages) or even directly from the local file system (`file:///`).

---

## 🚀 Key Features

- 🎨 **Real-Time 2D Vector Customization**
  - Instant base color selection, multi-tone panels, sleeves, and collars.
  - Geometric pattern overlays (stripes, gradients, chevrons, dots, and custom textures).
  - Multi-zone typography engine with customizable fonts, sizes, colors, and positioning (Chest, Back, Collar, Sleeves, Pockets).
  - Drag-and-drop custom logo and sponsor artwork upload with real-time canvas composition.

- 🚴 **High-Fidelity 3D Pro Cycling Jersey Engine**
  - Bespoke procedural geometry builder ([`js/cycling_model.js`](js/cycling_model.js)) tailored for authentic cycling apparel.
  - **Aerodynamic Race Cut:** Contoured chest, slim tapered waist, and drop-tail rear hem.
  - **3D Triple Rear Cargo Pockets:** 3 physical cargo pocket compartments with volumetric depth and top elastic seam band on the lower back.
  - **Aero Mandarin Zip Collar & Raglan Sleeves:** Standing collar with V-throat notch and extended mid-bicep aero sleeves with elastic cuffs.
  - **3D Zipper Assembly:** Physical metallic/matte zipper track and pull tab.

- 🌐 **Interactive 3D WebGL Studio**
  - Powered by **Three.js** with orbit controls, 360° rotation, smooth zoom, and responsive camera angle quick-snaps (Front, 3/4, Rear, Side).
  - Studio-grade multi-point lighting setup with subtle ambient highlights and soft shadows.
  - Dynamic material properties tuned for realistic sportswear fabric rendering.

- 📐 **Dynamic Dual-Hemisphere Planar UV Projection**
  - Automatically maps flat 2D SVG canvas designs onto 3D apparel geometries without requiring pre-baked UV unwrapping.
  - Computes world-space bounding boxes and dynamically projects front vertices ($Z > 0$) to the front texture coordinate space and back vertices ($Z \le 0$) with automatic horizontal mirror compensation.

- 📦 **Model Switcher & Custom 3D Model Ingestion (`.glb` / `.gltf`)**
  - Quick-toggle in the top toolbar between **Pro Aero Kit**, **Classic Tee**, and **Custom GLB Upload**.
  - Upload any standard 3D jersey, t-shirt, or mannequin model directly into the browser.
  - Automatic geometric normalization, origin re-centering, height scaling, and hanger accessory alignment.

- 🏷️ **VELOX Minimalist Brand Assets**
  - Integrated luxury minimal cycling brand identity ("VELOX APEX") with clean vector emblem and high-resolution typography badges.

- 📄 **Manufacturing-Ready Tech Pack Generator**
  - Generates comprehensive 2D production blueprints with panel callouts, color codes, dimensions, and logo placements.
  - One-click export to high-resolution PNG or printable PDF for factory sublimation printing.

- 💾 **Project Persistence (`.jersey`)**
  - Save full design configurations into lightweight JSON `.jersey` files and restore projects at any time.

---

## 🏗️ Architecture & Module Design

MiniJersey 3D Studio is built with modern Vanilla JavaScript adhering to clean separation of concerns and a reactive publish-subscribe architecture:

```text
mini-jersey-studio/
├── index.html            # Application shell & WebGL canvas container
├── css/
│   └── style.css         # Glassmorphic UI design system, layout & controls
├── js/
│   ├── app.js            # Main UI controller & DOM event coordinator
│   ├── state.js          # Centralized Pub/Sub state management
│   ├── renderer.js       # SVG-to-Canvas dynamic texture baking engine
│   ├── cycling_model.js  # 3D Pro Cycling Jersey procedural geometry generator
│   ├── three_viewer.js   # 3D WebGL scene, lighting & planar UV mapping
│   ├── techpack.js       # 2D production blueprint & PDF exporter
│   ├── geometry.js       # SVG paths & stock cycling symbols library
│   ├── patterns.js       # Procedural SVG geometric patterns
│   └── model_data.js     # Base64 embedded default 3D model (CORS-free)
├── img/
│   ├── velox_logo.jpg    # Ultra-modern minimal cycling brand logo
│   └── velox_minimal_badge.jpg # Minimalist road cycling badge
├── .github/
│   ├── workflows/        # GitHub Actions automated deployment
│   └── ISSUE_TEMPLATE/   # Issue and Pull Request standards
├── CITATION.cff          # Academic & software citation metadata
└── LICENSE               # MIT License
```

### Module Responsibilities

| Module | Purpose |
| :--- | :--- |
| [`js/cycling_model.js`](js/cycling_model.js) | Procedural 3D Pro Cycling Jersey engine (aero race-fit torso, raglan sleeves, aero collar, 3D rear cargo pockets, zipper). |
| [`js/state.js`](js/state.js) | Centralized state container. Dispatches update events to subscribers whenever colors, texts, logos, or patterns change. |
| [`js/renderer.js`](js/renderer.js) | Injects reactive state into flat SVG sewing templates, rasterizing them onto a high-resolution $2048 \times 1024$ `<canvas>` via `XMLSerializer`. |
| [`js/three_viewer.js`](js/three_viewer.js) | Manages Three.js scene graph, camera, studio lighting, materials, and executes Dynamic Planar UV coordinate reassignment. |
| [`js/techpack.js`](js/techpack.js) | Compiles front/back panels, Pantone/HEX palettes, and sponsor zones into production-ready specification sheets. |
| [`js/model_data.js`](js/model_data.js) | Contains the classic 3D model encoded as a Data URI to bypass browser CORS restrictions when opened locally. |

---

## ⚡ Quick Start

### Option 1: Live Demo (No installation required)
Visit the live deployment at [https://francescocastaldi.github.io/mini-jersey-studio/](https://francescocastaldi.github.io/mini-jersey-studio/).

### Option 2: Run Locally

Because MiniJersey 3D Studio uses standard browser APIs and embedded assets, you can run it with any static web server:

```bash
# 1. Clone the repository
git clone https://github.com/FrancescoCastaldi/mini-jersey-studio.git
cd mini-jersey-studio

# 2. Serve with any lightweight static server (e.g. Python, Node, VS Code Live Server)
python -m http.server 8000
# OR
npx serve .
```

Open your browser at `http://localhost:8000`.

---

## 🔬 Mathematical Planar UV Projection

To apply flat 2D jersey designs onto arbitrary 3D meshes without manual UV unwrapping in software like Blender, the engine executes a dual-hemisphere planar projection across all mesh vertices $\mathbf{v} = (x, y, z)$:

$$\text{Normalized Coordinates: } \hat{x} = \frac{x - x_{\min}}{x_{\max} - x_{\min}}, \quad \hat{y} = \frac{y - y_{\min}}{y_{\max} - y_{\min}}$$

$$u = \begin{cases} 
0.5 \cdot \hat{x} & \text{if } z > 0 \text{ (Front Hemisphere)} \\
0.5 + 0.5 \cdot (1 - \hat{x}) & \text{if } z \le 0 \text{ (Back Hemisphere with horizontal inversion)} 
\end{cases}$$

$$v = \hat{y}$$

This guarantees that text, sponsor logos, and geometric patterns remain upright and legible from both front and rear camera perspectives.

---

## 📄 Citation

If you use MiniJersey 3D Studio in academic research, apparel software benchmarks, or commercial design pipelines, please cite it using the metadata in [`CITATION.cff`](CITATION.cff):

```bibtex
@software{castaldi2026minijersey,
  author = {Castaldi, Francesco},
  title = {{MiniJersey 3D Studio: Real-Time Client-Side Cycling Jersey Customization & Dynamic Planar WebGL Renderer}},
  year = {2026},
  url = {https://francescocastaldi.github.io/mini-jersey-studio/}
}
```

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
