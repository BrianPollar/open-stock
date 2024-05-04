import { IdataArrayResponse } from '@open-stock/stock-universal';
import express from 'express';
import { createMockDeliveryCity, createMockDeliveryCitys } from '../../../mocks/stock-counter-mocks';

/**
 * Express router for deliverycity routes
 */
export const deliverycityRoutesDummy = express.Router();

deliverycityRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

deliverycityRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
  res.status(200).send(createMockDeliveryCity());
});

deliverycityRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockDeliveryCitys(Number(req.params.limit))
  };
  res.status(200).send(response);
});

deliverycityRoutesDummy.put('/update/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

deliverycityRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

deliverycityRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});
