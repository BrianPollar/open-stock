import express from 'express';
import { createMockCustomer, createMockCustomers } from '../../../../mocks/stock-counter-mocks';
/**
 * Router for handling customer-related routes.
 */
export const customerRoutesDummy = express.Router();
customerRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
customerRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send(createMockCustomer());
});
customerRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: createMockCustomers(Number(req.params.limit))
    };
    res.status(200).send(response);
});
customerRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
customerRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
customerRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=customer.routes.js.map