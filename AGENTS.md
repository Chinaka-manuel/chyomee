# AGENTS.md

## Project Structure
- **server/**: Express.js backend (Node.js, ES modules)
- **client/**: React frontend (Vite, TailwindCSS)

## Commands

### Server (backend/)
```bash
npm run dev    # Start server with file watching (node --watch server.js)
npm start      # Start server
```

### Client (client/)
```bash
npm run dev    # Start Vite dev server
npm run build  # Build for production
npm run lint   # Run ESLint
```

## Environment
- Server env vars: `server/.env` (see `server/.env.example` for template)
- Client env vars: `client/.env`
- Key Cloudinary vars: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Image uploads go to Cloudinary via `POST /api/v1/files/upload` (requires auth)
- Product images are saved as Cloudinary URLs in MongoDB `Product.image` field
