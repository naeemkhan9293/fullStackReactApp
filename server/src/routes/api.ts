import express from 'express';
import { router as authRoutes } from './auth';
import { router as serviceRoutes } from './services';
import { router as bookingRoutes } from './bookings';
import { router as reviewRoutes } from './reviews';
import { router as uploadRoutes } from './upload';
import { router as dashboardRoutes } from './dashboard';
import { router as subscriptionRoutes } from './subscription';
import { router as paymentRoutes } from './payment';
import { router as walletRoutes } from './wallet';
import savedServicesRoutes from './savedServices';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Mount routers
router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/upload', uploadRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/payments', paymentRoutes);
router.use('/wallet', walletRoutes);
router.use('/saved-services', savedServicesRoutes);

export { router };
