import express from 'express';
import { createMockItemDecoy, createMockItemDecoys } from '../../../tests/stock-counter-mocks';

/**
 * Router for item decoy routes.
 */
export const itemDecoyRoutesDummy = express.Router();

itemDecoyRoutesDummy.post('/create/:how/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

itemDecoyRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
  res.status(200).send(createMockItemDecoys(Number(req.params.limit)));
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
