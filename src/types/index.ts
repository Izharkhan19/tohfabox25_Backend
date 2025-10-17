export interface CreatePaymentIntentRequest {
    amount: number;
}

export interface GenerateInvoiceRequest {
    orderId: string;
    paymentIntentId: string;
    cart: { product: { name: string; price: number }; quantity: number }[];
    total: number;
}