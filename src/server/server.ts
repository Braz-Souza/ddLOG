import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables first
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initializeDatabase } from './database/connection.js';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine if running in development or production
const isDev = __dirname.includes('/src/');

const app = express();
const PORT = process.env.PORT || (isDev ? 3001 : 3000);

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

initializeDatabase();

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'ddLOG Server is running',
    timestamp: new Date().toISOString()
  });
});

// Only serve static files in production mode
if (!isDev) {
  const staticPath = path.join(__dirname, '..');
  const htmlPath = path.join(__dirname, '../index.html');
  
  // Serve static files
  app.use(express.static(staticPath));

  // Catch all handler: send back React's index.html file for client-side routing
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        error: 'API route not found'
      });
    }
    
    res.sendFile(htmlPath);
  });
} else {
  // In development, only handle unknown API routes
  app.use('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({
        success: false,
        error: 'API route not found'
      });
    }
    
    // For non-API routes in development, return a message
    res.status(404).json({
      message: 'Frontend served by Vite dev server on port 3000'
    });
  });
}

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 App available at: http://localhost:${PORT}`);
});