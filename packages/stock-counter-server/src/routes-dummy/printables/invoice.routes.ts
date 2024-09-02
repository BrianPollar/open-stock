import { IdataArrayResponse } from '@open-stock/stock-universal';
import express from 'express';
import { createMockInvoice, createMockInvoices, createMockReceipt, createMockReceipts } from '../../../../mocks/stock-counter-mocks';

/**
 * Router for handling invoice routes.
 */
export const invoiceRoutesDummy = express.Router();

invoiceRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

invoiceRoutesDummy.put('/update/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

invoiceRoutesDummy.get('/getone/:invoiceId/:companyIdParam', (req, res) => {
  res.status(200).send(createMockInvoice());
});

invoiceRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockInvoices(Number(req.params.limit))
  };

  res.status(200).send(response);
});

invoiceRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

invoiceRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
  res.status(200).send(createMockInvoices(Number(req.params.limit)));
});

invoiceRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

// payments
invoiceRoutesDummy.post('/createpayment/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

invoiceRoutesDummy.put('/updatepayment/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

invoiceRoutesDummy.get('/getonepayment/:urId/:companyIdParam', (req, res) => {
  res.status(200).send(createMockReceipt());
});

invoiceRoutesDummy.get('/getallpayments/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: 10,
    data: createMockReceipts(10)
  };

  res.status(200).send(response);
});

invoiceRoutesDummy.put('/deleteonepayment/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

invoiceRoutesDummy.put('/deletemanypayments/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});
