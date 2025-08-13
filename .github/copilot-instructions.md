# Copilot Instructions for webpsicologos

## Project Overview
- **webpsicologos** is a full-stack web platform for connecting psychologists and clients, with a React frontend and a Node.js/Express backend.
- **Frontend** (`frontend/`): React (Create React App), using React Router for navigation. Demo data is used for psychologist and user profiles in components like `Search.js` and `PsDetails.js`.
- **Backend** (`backend/`): Node.js with Express, using Supabase for authentication and data storage. Key routes are under `/api/` (see `backend/index.js`).

## Key Architectural Patterns
- **Authentication**: JWT-based, with tokens issued on login/registration (`authController.js`). Auth middleware (`authMiddleware.js`) protects profile and other sensitive routes.
- **User Types**: There are two main user types: `psicologo` and `paciente`. Registration and profile logic branches based on this type.
- **Profile Data**: Profiles are stored in separate tables (`perfiles_psicologos`, `perfiles_clientes`) in Supabase. Profile endpoints are `/api/profile` (see `profileRoutes.js`).
- **Frontend Routing**: Main routes are defined in `App.js`. Example: `/search` for psychologist search, `/profile` for user profile, `/psychologist/:id` for details.
- **Demo Data**: Many frontend components use hardcoded demo data for development. Replace with API calls as backend endpoints are implemented.

## Developer Workflows
- **Frontend**:
  - Start: `cd frontend && npm start` (runs on http://localhost:3000)
  - Test: `npm test`
  - Build: `npm run build`
- **Backend**:
  - Start: `cd backend && node index.js` (default port 5000)
  - Environment: Requires `.env` with `SUPABASE_URL`, `SUPABASE_KEY`, `JWT_SECRET`.

## Project-Specific Conventions
- **API endpoints**: All backend endpoints are prefixed with `/api/`.
- **Error Handling**: Centralized error middleware (`errorMiddleware.js`).
- **Frontend Styling**: Uses Bootstrap classes and custom CSS (see `LandingPage.css`, `Register.css`).
- **Navigation**: Use `useNavigate` from `react-router-dom` for programmatic navigation.
- **Profile Avatars**: If no photo is provided, a default icon is shown (see `bi-person` usage in components).

## Integration Points
- **Supabase**: Used for both authentication and data storage. See `supabaseClient.js` in both frontend and backend for setup.
- **JWT**: Used for session management. Tokens are required for protected routes.

## Examples
- To add a new protected route in backend, use `authenticate` middleware:
  ```js
  router.get('/secure', authenticate, (req, res) => { ... });
  ```
- To add a new frontend page, add a `<Route>` in `App.js` and create the component in `src/pages/` or `src/components/`.

## Key Files/Directories
- `backend/index.js`: Express app entrypoint, route wiring
- `backend/controllers/`: Route logic (auth, profile, etc)
- `backend/routes/`: Route definitions
- `backend/middlewares/`: Auth and error handling
- `frontend/src/App.js`: Main React router
- `frontend/src/components/`: UI components
- `frontend/src/pages/`: Page-level components
- `frontend/src/api/`: (Planned) API call logic

---
For any new code, follow the patterns in the relevant directory. Use demo data for UI if backend is not yet implemented, but prefer real API calls when available.
