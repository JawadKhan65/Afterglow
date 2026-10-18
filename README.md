# Afterglow · Event Management

Frontend event management application built with React, Redux Toolkit, React Router, and Vite.

## Requirements and setup

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Vite prints the local address after the server starts, usually `http://localhost:5173`.

Create and preview a production build with:

```sh
npm run build
npm run preview
```

## Current features

- Shared responsive navigation and route shell.
- Event discovery, event details, login, registration, and My Events routes.
- Redux Toolkit authentication state with registration, login, logout, and persisted sessions.
- Protected My Events route and client-side form validation.
- Ticketmaster event search with keyword, city, category, date, and pagination filters.
- Event detail view with venue, location, date, images, and Ticketmaster ticket link.
- Signed-in users can register once per event, cancel upcoming registrations, and view upcoming and completed registrations in My Events.

## Ticketmaster API setup

1. Copy `.env.example` to `.env` in the project root.
2. Replace `your_ticketmaster_consumer_key` with the Consumer Key from your Ticketmaster Developer account.
3. Restart the dev server with `npm run dev` after changing the key.

Vite exposes `VITE_` variables to browser code. The `.env` file is ignored by Git, which prevents accidentally committing it, but a key used directly by a browser app is visible to visitors in the built JavaScript and network requests. Use a restricted development key and do not treat this as a private server secret. A backend proxy is needed to keep the key private in a deployed application.

## Authentication demo

Authentication is simulated in the browser as required by the assignment. Demo accounts are stored in local storage, including their passwords, so use a unique throwaway password. This is not secure authentication and must not be used for real accounts. The session persists after refresh; logging out removes the session but keeps the demo account available for another login.

## Data storage and security

This assignment is a frontend simulation. Demo accounts and event registrations are saved in browser local storage, separately by user. Local `.env` files are ignored by Git. Never commit API keys or other secrets. A key configured with a Vite `VITE_` variable is included in browser code and can be seen by visitors; a backend proxy is required to keep it private in a public deployment.

## Project structure

- `src/features/auth/` — simulated account and session state.
- `src/features/registrations/` — user-specific event registration state.
- `src/services/ticketmaster.js` — Ticketmaster API requests and error handling.
- `src/pages/` — event discovery, event details, account, and registration views.
- `src/components/` — shared layout and protected route.
- `src/store.js` — Redux Toolkit store and registration persistence middleware.
