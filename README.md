# Lumière — Premium AR Restaurant Menu SaaS

Multi-tenant SaaS platform for luxury AR restaurant menus. React + Vite frontend, Node.js + MongoDB backend.

## Features

- **Landing Page** — Dark luxury UI with glassmorphism, food categories, search, and dish cards
- **AR Food Viewer** — WebXR hit-test placement on horizontal surfaces with real-world scale 3D models
- **3D Preview** — Rotate, zoom, and pan models on devices without AR support
- **7 Food Categories** — Pizza, Burger, Pasta, Sandwich, Biryani, Dessert, Drinks
- **QR Code** — Scannable QR opens the menu directly
- **WhatsApp Orders** — Send cart directly via WhatsApp
- **Admin Panel** — Add/edit dishes, upload GLB models, manage prices and categories

## Tech Stack

- React 19 + Vite 8
- Tailwind CSS 4
- Three.js + React Three Fiber + Drei
- WebXR via @react-three/xr
- Framer Motion animations
- Zustand state management

## Getting Started

```bash
# Frontend
npm install && npm run dev

# Backend (separate terminal)
cd backend && npm install && npm run dev

# Or with Docker
cp .env.example .env
docker compose up -d
npm run seed
```

| URL | Purpose |
|-----|---------|
| `http://localhost:5173` | Demo landing |
| `http://localhost:5173/r/lumiere` | Tenant menu (after seed) |
| `http://localhost:5173/dashboard` | CMS (demo@lumiere.app / demo12345) |
| `http://localhost:4000/health` | API health |

For AR features, use a WebXR-compatible mobile browser (Chrome on Android, Safari on iOS 15+).

## AR Usage

1. Tap **View in AR** on any dish
2. Tap **Launch AR Experience** to open the camera
3. Point at a flat table surface
4. Tap **Tap to Place on Table** to position the 3D model
5. Walk around to view the dish at real-world scale

## Admin Panel

Navigate to `/admin` to:

- Update restaurant name, tagline, and WhatsApp number
- Add, edit, or delete menu items
- Upload custom GLB 3D models
- Manage categories and prices

## Production Build

```bash
npm run build
npm run preview
```

Deploy the `dist` folder to any static host. HTTPS is required for WebXR.

## AR.js Compatibility

WebXR is the primary AR mode. For AR.js marker-based AR, host the built app and configure an AR.js marker page pointing to the same menu URL. The QR code on the landing page links directly to the menu for seamless mobile access.
