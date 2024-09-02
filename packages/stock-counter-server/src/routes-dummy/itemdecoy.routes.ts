import { IdataArrayResponse } from '@open-stock/stock-universal';
import express from 'express';
import { createMockItemDecoy, createMockItemDecoys } from '../../../mocks/stock-counter-mocks';

/**
 * Router for item decoy routes.
 */
export const itemDecoyRoutesDummy = express.Router();

itemDecoyRoutesDummy.post('/create/:how/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

itemDecoyRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockItemDecoys(Number(req.params.limit))
  };

  res.status(200).send(response);
});

itemDecoyRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
  res.status(200).send(createMockItemDecoy());
});

itemDecoyRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

itemDecoyRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});
