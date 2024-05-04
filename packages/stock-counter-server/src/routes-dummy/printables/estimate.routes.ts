import { IdataArrayResponse } from '@open-stock/stock-universal';
import express from 'express';
import { createMockEstimate, createMockEstimates } from '../../../../mocks/stock-counter-mocks';

/** Router for estimate routes */
export const estimateRoutesDummy = express.Router();

estimateRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

estimateRoutesDummy.get('/getone/:estimateId/:companyIdParam', (req, res) => {
  res.status(200).send(createMockEstimate());
});

estimateRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockEstimates(Number(req.params.limit))
  };
  res.status(200).send(response);
});

estimateRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

estimateRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockEstimates(Number(req.params.limit))
  };
  res.status(200).send(response);
});

estimateRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

