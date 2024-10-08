/* eslint-disable @typescript-eslint/no-misused-promises */

import { IdataArrayResponse } from '@open-stock/stock-universal';
import express from 'express';
import { createMockTaxReport, createMockTaxReports } from '../../../../../mocks/stock-counter-mocks';

/**
 * Router for tax report routes.
 */
export const taxReportRoutesDummy = express.Router();


taxReportRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});


taxReportRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
  res.status(200).send(createMockTaxReport());
});


taxReportRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockTaxReports(Number(req.params.limit))
  };

  res.status(200).send(response);
});


taxReportRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});


taxReportRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockTaxReports(Number(req.params.limit))
  };

  res.status(200).send(response);
});


taxReportRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});
