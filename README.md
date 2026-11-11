# Chiomee Stores

### Contemporary fashion. Made to feel like you.

Chiomee Stores is a fashion e-commerce experience for discovering wardrobe essentials, occasionwear, accessories, and made-to-measure pieces. Shop ready-to-wear collections, explore editorial content, and request custom garments—all in one place.

---

## The experience

- **Explore the collection** — Browse clothing, shoes, bags, jewellery, fabrics, and more by category.
- **Find your fit** — Search, filter, sort, and view product details, variants, and availability.
- **Make it yours** — Submit a made-to-measure request with garment and measurement details.
- **Shop with confidence** — Manage your account, cart, checkout, orders, and payment receipts.
- **Stay inspired** — Read fashion stories, discover new arrivals, and browse featured articles.
- **Run the store** — Give administrators tools for products, inventory, orders, customers, promotions, reviews, articles, and site content.

## Built with

| Storefront | Store services |
| --- | --- |
| React 19 | Node.js and Express 5 |
| Vite 8 | MongoDB with Mongoose |
| React Router | Paystack integration (optional) |
| Tailwind CSS 4 | Resend email delivery |

The client and API are separate applications. The client presents the storefront and admin dashboard; the server owns accounts, catalog data, inventory, checkout, payment verification, and email workflows.

```text
Shopper ──> React storefront ──> Express API ──> MongoDB
                                      ├────────> Paystack (optional)
                                      └────────> Resend
```

## Get started

You’ll need Node.js and npm. Install each app’s dependencies and run the frontend and backend in separate terminals.

### 1. Configure the server

```powershell
cd server
npm ci
if (-not (Test-Path .env)) { New-Item .env -ItemType File }
```

Fill in the server configuration in `server/.env`. At minimum, local development needs a MongoDB connection and a JWT secret of at least 32 characters. Email, payment, and deployment settings depend on which integrations you enable; see [server setup and integration notes](./server/README.md).

### 2. Start the API

```powershell
npm run dev
```

The API starts on port `5000` by default.

### 3. Start the storefront

In another terminal:

```powershell
cd client
npm ci
npm run dev
```

Open the local URL printed by Vite. The development storefront connects to the API at `http://localhost:5000/api/v1`.

## Administrator access

Administrator accounts are stored in MongoDB, and passwords are hashed before storage. Register through the admin signup page with the server-configured passcode, or provision an account from the `server` directory:

```powershell
npm run admin:create
```

The provisioning command prompts for the administrator’s name, email, and password. Email verification is required when enabled. See the [server README](./server/README.md) for details.

## Payments and email

- Paystack is optional. Configure its secret on the server only; successful payments are verified by the API.
- Bank-transfer payments remain pending until an administrator verifies them.
- Resend handles account verification, password resets, order confirmations, receipts, and store notifications when configured.
- Never put API keys, database credentials, signing secrets, or passwords in client code or commit them to source control.

## Project layout

```text
.
├── client/                 # React storefront and admin interface
│   └── src/
│       ├── components/     # Shared storefront and admin UI
│       ├── pages/          # Shop, account, checkout, and admin pages
│       ├── services/       # API client
│       └── data/           # Fashion categories and storefront content
└── server/                 # Express API and MongoDB models
    ├── config/             # Email and Cloudinary setup
    ├── controllers/        # API operations
    ├── models/             # MongoDB schemas
    ├── routes/             # API endpoints
    └── scripts/            # Admin provisioning and maintenance
```

## Useful commands

| Location | Command | Purpose |
| --- | --- | --- |
| `client/` | `npm run dev` | Start the storefront |
| `client/` | `npm run build` | Create the production build |
| `client/` | `npm run lint` | Run ESLint |
| `client/` | `npm run preview` | Preview the production build |
| `server/` | `npm run dev` | Start the API with watch mode |
| `server/` | `npm start` | Start the API |
| `server/` | `npm run admin:create` | Provision an administrator interactively |

## Before deploying

- Configure production MongoDB, JWT, frontend/API URLs, and any enabled email or payment integrations.
- Use HTTPS for the storefront, API, payment callbacks, and webhooks.
- Keep server `.env` files and all credentials out of Git.
- Build the storefront with `npm run build` from `client/`.

---

**Chiomee Stores** — Find your look. Make it yours.
