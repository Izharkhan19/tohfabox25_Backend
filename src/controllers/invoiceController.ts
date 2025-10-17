// import { Request, Response } from 'express';
// import { InvoiceService } from '../services/invoiceService';
// import { GenerateInvoiceRequest } from '../types';
// import { handleError } from '../utils/errorHandler';

// const invoiceService = new InvoiceService();

// export const generateInvoice = async (req: Request, res: Response) => {
//     try {
//         const body = req.body as GenerateInvoiceRequest;
//         if (!body.orderId || !body.paymentIntentId || !body.cart || !body.total) {
//             return res.status(400).json({ error: 'Missing required fields' });
//         }
//         const invoiceUrl = await invoiceService.generateInvoice(body);
//         res.json({ invoiceUrl });
//     } catch (error: any) {
//         handleError(res, error, 'Error generating invoice');
//     }
// };

import { Request, Response } from 'express';
import { stripe } from '../services/stripeService';
import { generateInvoice } from '../services/invoiceService';

export const generateInvoiceController = async (req: Request, res: Response) => {

    try {
        const { session_id } = req.body;
        if (!session_id) return res.status(400).json({ message: 'Missing session_id' });
        const session = await stripe.checkout.sessions.retrieve(session_id);
        const invoiceUrl = await generateInvoice(session);
        return res.json({
            success: true,
            invoiceUrl,
        });
    } catch (err: any) {
        console.error('Invoice generation failed:', err.message);
        res.status(500).json({ message: 'Error generating invoice' });
    }
};
