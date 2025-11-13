# VisionLink 
## Quick Start 
Prerequisites: Node 18+

```bash
# 1) Backend
cd server
cp .env.example .env
npm install
npm run seed   # creates admin user and sample data
npm run dev    # starts API on http://localhost:5000

# 2) Frontend (in a new terminal at project root)
cd ..
npm install
npm run dev    # Vite dev server on http://localhost:5173 (proxied to API)
```

Login using the seeded admin credentials:

- **Email:** `admin@visionlink.app`
- **Password:** `VisionLink123!`

## Production-like local build

```bash
# Build frontend and serve from the Node API
npm run build
cd server && npm run dev
# Open http://localhost:5000
```

## Notes for Deliverable 4

Local Database: SQLite

To switch to MySQL later, replace the SQLite section in `server/src/db.js` with your MySQL connector. Keep the same REST routes to avoid breaking the front-end.

## Modules wired to the live API
- **Authentication** (login stores a JWT in `localStorage`)
- **Projects** — full CRUD
- **Tasks** — full CRUD
- **Clients** — full CRUD (API routes implemented; UI not yet wired)

Other UI sections exist and can be incrementally wired (Messages, Files, Calendar, Reports, Search).

## Folder Structure 
```
server/
  package.json
  .env.example
  src/
    index.js
    db.js
    auth.js
    routes.projects.js
    routes.tasks.js
    routes.clients.js
    seed.js
src/lib/api.ts
vite.config.ts
README-SETUP.md
```

## Post-Deliverable 4 ChangeLog

URL-base Client-side Routing
Authentication Persists after refresh in same Tab
Added features/mockup for Calendar

Updated and fixed CRUD for:
- Authentication
- Tasks
- Projects
- Clients