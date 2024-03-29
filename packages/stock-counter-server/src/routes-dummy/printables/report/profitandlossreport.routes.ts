import { IdataArrayResponse } from '@open-stock/stock-universal';
import express from 'express';
import { createMockProfitAndLossReport, createMockProfitAndLossReports } from '../../../../../tests/stock-counter-mocks';

/**
 * Router for profit and loss report.
 */
export const profitAndLossReportRoutesDummy = express.Router();

profitAndLossReportRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

profitAndLossReportRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
  res.status(200).send(createMockProfitAndLossReport());
});

profitAndLossReportRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockProfitAndLossReports(Number(req.params.limit))
  };
  res.status(200).send(response);
});

profitAndLossReportRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

profitAndLossReportRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockProfitAndLossReports(Number(req.params.limit))
  };
  res.status(200).send(response);
});

profitAndLossReportRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});
