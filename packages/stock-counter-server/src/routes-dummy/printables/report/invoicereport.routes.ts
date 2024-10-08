import { IdataArrayResponse } from '@open-stock/stock-universal';
import express from 'express';
import { createMockInvoiceReport, createMockInvoiceReports } from '../../../../../mocks/stock-counter-mocks';

/**
 * Express router for invoices report routes.
 */
export const invoicesReportRoutesDummy = express.Router();

invoicesReportRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

invoicesReportRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
  res.status(200).send(createMockInvoiceReport());
});

invoicesReportRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockInvoiceReports(Number(req.params.limit))
  };

  res.status(200).send(response);
});

invoicesReportRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

invoicesReportRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockInvoiceReports(Number(req.params.limit))
  };

  res.status(200).send(response);
});

invoicesReportRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});
