import { IdataArrayResponse } from '@open-stock/stock-universal';
import express from 'express';
import { createMockPayment, createMockPayments } from '../../../mocks/stock-counter-mocks';

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
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockPayments(Number(req.params.limit))
  };

  res.status(200).send(response);
});

paymentRoutesDummy.get('/getmypayments/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockPayments(Number(req.params.limit))
  };

  res.status(200).send(response);
});

paymentRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

paymentRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: []
  };

  res.status(200).send(response);
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
