import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createApiApp } from './server/src/app.ts';
import { env } from './server/src/config/env.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer(): Promise<void> {
  const app = createApiApp();
  const isProduction = env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(
      `[Server] Predictive Emergency Blood Shortage Network running on http://0.0.0.0:${env.PORT} (${env.NODE_ENV})`,
    );
  });
}

startServer().catch((err) => {
  console.error('Failed to initialize server:', err instanceof Error ? err.message : 'Unknown error');
  process.exit(1);
});
