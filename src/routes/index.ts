import { Router } from 'express';
import paymentRoutes from './paymentRoutes';
import invoiceRoutes from './invoiceRoutes';

const router = Router();

router.get('/', (req, res) => {
    res.send('Stripe Backend Server is Running!');
});

router.use(paymentRoutes);
router.use(invoiceRoutes);

export default router;