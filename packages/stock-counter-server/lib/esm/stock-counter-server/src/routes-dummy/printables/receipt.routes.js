import express from 'express';
import { createMockReceipt, createMockReceipts } from '../../../../tests/stock-counter-mocks';
/**
 * Router for handling receipt routes.
 */
export const receiptRoutesDummy = express.Router();
receiptRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
receiptRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
    res.status(200).send(createMockReceipt());
});
receiptRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    res.status(200).send(createMockReceipts(Number(req.params.limit)));
});
receiptRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
receiptRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
    res.status(200).send(createMockReceipts(Number(req.params.limit)));
});
receiptRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
receiptRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=receipt.routes.js.map