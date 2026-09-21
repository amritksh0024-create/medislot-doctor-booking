import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// 1. Basic security & caching headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// 2. Health check endpoint for Hostinger / container monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'MediSlot'
  });
});

// 3. Serve static production assets from Vite 'dist'
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// 4. SPA Fallback: send index.html for all non-file routes so React Router handles navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// 5. Start Server
app.listen(PORT, HOST, () => {
  console.log(`[MediSlot] Production server running at http://${HOST}:${PORT}`);
  console.log(`[MediSlot] Health check available at http://${HOST}:${PORT}/health`);
});
