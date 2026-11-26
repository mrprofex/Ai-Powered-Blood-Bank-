import { createApiApp } from '../server/src/app.ts';

// Vercel invokes this Express application as a serverless function. The local
// development server remains in server.ts, where it owns the listener and
// Vite middleware.
export default createApiApp();
