# Afterglow · Event Management

Frontend event management application built with React, Redux Toolkit, React Router, and Vite.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

## Current features

- Shared responsive navigation and route shell.
- Event discovery, event details, login, registration, and My Events routes.
- Redux Toolkit authentication state with registration, login, logout, and persisted sessions.
- Protected My Events route and client-side form validation.

## Authentication demo

Authentication is simulated in the browser as required by the assignment. Demo accounts are stored in local storage, including their passwords, so use a unique throwaway password. This is not secure authentication and must not be used for real accounts. The session persists after refresh; logging out removes the session but keeps the demo account available for another login.

## Security and configuration

Local `.env` files are ignored by Git. Never commit API keys or other secrets. Ticketmaster API integration will be added in a later step using a local environment variable.
