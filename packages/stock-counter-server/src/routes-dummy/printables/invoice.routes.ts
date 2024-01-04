import express from 'express';
import { createMockInvoice, createMockInvoices, createMockReceipt, createMockReceipts } from '../../../../tests/stock-counter-mocks';

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
  res.status(200).send(createMockInvoices(Number(req.params.limit)));
});

invoiceRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

invoiceRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
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
  res.status(200).send(createMockReceipts(10));
});

invoiceRoutesDummy.put('/deleteonepayment/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

invoiceRoutesDummy.put('/deletemanypayments/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});
