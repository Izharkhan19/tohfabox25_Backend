// import { Router } from 'express';
// import { generateInvoice } from '../controllers/invoiceController';

// const router = Router();

// router.post('/api/stripe/generate-invoice', generateInvoice);

// export default router;

import { Router } from 'express';
import { generateInvoiceController } from '../controllers/invoiceController';

const router = Router();

router.post('/api/generate-invoice', generateInvoiceController);

export default router;
