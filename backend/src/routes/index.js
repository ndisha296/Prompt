import { Router } from 'express';
import authRoutes from './authRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import prescriptionRoutes from './prescriptionRoutes.js';
import documentRoutes from './documentRoutes.js';
import adminRoutes from './adminRoutes.js';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'MediCore Connect API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    security: {
      hipaa_aligned: true,
      encryption: 'AES-256 / TLS 1.3',
      rate_limiting: 'active'
    }
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/doctors', doctorRoutes);
apiRouter.use('/appointments', appointmentRoutes);
apiRouter.use('/prescriptions', prescriptionRoutes);
apiRouter.use('/documents', documentRoutes);
apiRouter.use('/admin', adminRoutes);

export default apiRouter;
