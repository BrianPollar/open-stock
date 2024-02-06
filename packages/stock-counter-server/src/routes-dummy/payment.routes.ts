import express from 'express';
import { createMockPayment, createMockPayments } from '../../../tests/stock-counter-mocks';

/**
 * Express router for payment routes.
 */
export const paymentRoutesDummy = express.Router();

paymentRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

paymentRoutesDummy.put('/update/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

paymentRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
  res.status(200).send(createMockPayment());
});

paymentRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
  res.status(200).send(createMockPayments(Number(req.params.limit)));
});

paymentRoutesDummy.get('/getmypayments/:companyIdParam', (req, res) => {
  res.status(200).send(createMockPayments(Number(req.params.limit)));
});

paymentRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

paymentRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

paymentRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

// get ipn
paymentRoutesDummy.get('/ipn', (req, res) => {
  res.status(200).send({ success: true });
});


paymentRoutesDummy.get('/paymentstatus/:orderTrackingId/:paymentRelated', (req, res) => {
  res.status(200).send({ success: true });
});
