import express from 'express';
import { createMockCustomer, createMockCustomers } from '../../../../tests/stock-counter-mocks';

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
  res.status(200).send(createMockCustomers(Number(req.params.limit)));
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
