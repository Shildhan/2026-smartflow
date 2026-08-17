import { Router } from 'express';
import * as authCtrl from '../controllers/authController';
import * as trafficCtrl from '../controllers/trafficController';
import * as simCtrl from '../controllers/simulationController';
import * as juncCtrl from '../controllers/junctionController';
import * as routeCtrl from '../controllers/routeController';
import * as recCtrl from '../controllers/recommendationController';
import * as alertCtrl from '../controllers/alertController';
import * as reportCtrl from '../controllers/reportController';
import { authenticateToken, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

// Health Check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SmartFlow Database Backend API', time: new Date().toISOString() });
});

// Authentication
router.get('/auth/check-email', authCtrl.checkEmail);
router.post('/auth/login', authCtrl.login);
router.post('/auth/register', authCtrl.register);
router.post('/auth/forgot-password', authCtrl.forgotPassword);
router.post('/auth/reset-password', authCtrl.resetPassword);
router.get('/auth/me', authCtrl.getCurrentUser);

// Traffic & Map Corridors (MongoDB)
router.get('/traffic/roads', trafficCtrl.getRoads);
router.get('/traffic/roads/:id', trafficCtrl.getRoadById);
router.put('/traffic/roads/:id', optionalAuth, trafficCtrl.updateRoad);
router.get('/traffic/junctions', trafficCtrl.getJunctions);
router.get('/traffic/junctions/:id', trafficCtrl.getJunctionById);
router.get('/traffic/peak-stats', trafficCtrl.getPeakHourStats);
router.get('/traffic/dashboard', trafficCtrl.getDashboardOverview);
router.get('/traffic/zone-distribution', trafficCtrl.getZoneDistribution);
router.post('/traffic/reset-demo', trafficCtrl.resetDemoData);

// Simulation & History (MongoDB)
router.post('/simulation/run', optionalAuth, simCtrl.runSimulation);
router.get('/simulation/history', optionalAuth, simCtrl.getSimulationHistory);
router.get('/simulation/:id', optionalAuth, simCtrl.getSimulationById);
router.delete('/simulation/:id', optionalAuth, simCtrl.deleteSimulation);
router.post('/simulation/apply/:id', optionalAuth, simCtrl.applySimulationToLive);

// Junction Signal Timing
router.put('/junctions/:id/signal', optionalAuth, juncCtrl.updateJunctionSignal);
router.post('/junctions/:id/auto-optimize', optionalAuth, juncCtrl.autoOptimizeJunction);

// Route Optimization & Diversion
router.get('/routes/alternatives', routeCtrl.getRouteAlternatives);
router.post('/routes/apply-diversion/:id', optionalAuth, routeCtrl.applyDiversion);

// AI Recommendations
router.get('/recommendations', recCtrl.getRecommendations);
router.post('/recommendations/apply/:id', optionalAuth, recCtrl.applyRecommendation);

// Alerts & Incidents
router.get('/alerts', alertCtrl.getAlerts);
router.put('/alerts/:id/read', optionalAuth, alertCtrl.markAlertAsRead);
router.post('/alerts/create', optionalAuth, alertCtrl.createAlert);

// Reports & Audit Generation
router.get('/reports/generate', optionalAuth, reportCtrl.generateReportData);
router.get('/reports/user', optionalAuth, reportCtrl.getUserReports);

export default router;
