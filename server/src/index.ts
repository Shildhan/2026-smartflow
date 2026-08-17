import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Root Status
app.get('/', (_req, res) => {
  res.json({
    name: 'SmartFlow Intelligent Traffic Management & Simulation API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/demo-users',
      dashboard: '/api/traffic/dashboard',
      roads: '/api/traffic/roads',
      junctions: '/api/traffic/junctions',
      simulation: '/api/simulation/run',
      zoneDistribution: '/api/traffic/zone-distribution',
      recommendations: '/api/recommendations',
      alerts: '/api/alerts',
      reports: '/api/reports/generate',
    },
  });
});

// Start Server
export const startServer = async () => {
  await connectDB();
  if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 SmartFlow Traffic Backend running on port ${PORT}`);
      console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
      console.log(`🚦 Real-time Simulation Engine & AI Recommender Ready`);
      console.log(`====================================================`);
    });
  }
};

if (process.env.VERCEL !== '1') {
  startServer();
}

export default app;

