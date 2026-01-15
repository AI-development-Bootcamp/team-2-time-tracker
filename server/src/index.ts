import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());

// Health check endpoint for Docker/load balancer monitoring
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
  console.log(`Health check: http://localhost:${config.PORT}/health`);
});
