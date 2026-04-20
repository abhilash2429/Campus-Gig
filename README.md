# Campus GIG

A monorepo implementation of the Campus GIG platform described in [agents.md](/C:/Users/abhii/Desktop/Projects/SRP/agents.md).

## Workspaces

- `server`: Express + MongoDB + Firebase Admin + Razorpay sandbox
- `client`: React + Vite + Firebase client SDK

## Quick Start

1. Install workspace dependencies from the repo root.
2. Fill in `server/.env` and `client/.env` from the example files.
3. Start the backend with `npm run dev:server`.
4. Start the frontend with `npm run dev:client`.

## Notes

- Firebase Admin credentials are required before authenticated API routes will work.
- MongoDB, Firebase Auth, Firebase Storage, and Razorpay are not mocked in this scaffold.
- The frontend includes approval-state handling so pending users can sign in and see that their account still needs review.

