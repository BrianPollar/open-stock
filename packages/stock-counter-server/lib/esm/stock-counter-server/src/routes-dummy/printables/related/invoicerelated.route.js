import express from 'express';
import { createMockInvoiceRelated, createMockInvoiceRelateds } from '../../../../../mocks/stock-counter-mocks';
/**
 * Router for handling invoice related routes.
 */
export const invoiceRelateRoutesDummy = express.Router();
invoiceRelateRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send(createMockInvoiceRelated());
});
invoiceRelateRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: createMockInvoiceRelateds(Number(req.params.limit))
    };
    res.status(200).send(response);
});
invoiceRelateRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
    res.status(200).send(createMockInvoiceRelateds(Number(req.params.limit)));
});
invoiceRelateRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=invoicerelated.route.js.map