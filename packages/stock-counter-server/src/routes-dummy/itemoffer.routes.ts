import { IdataArrayResponse } from '@open-stock/stock-universal';
import express from 'express';
import { createMockItemOffer, createMockItemOffers } from '../../../mocks/stock-counter-mocks';

/**
 * Router for item offers.
 */
export const itemOfferRoutesDummy = express.Router();

itemOfferRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

itemOfferRoutesDummy.get('/getall/:type/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockItemOffers(Number(req.params.limit))
  };
  res.status(200).send(response);
});

itemOfferRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
  res.status(200).send(createMockItemOffer());
});

itemOfferRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

itemOfferRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});
