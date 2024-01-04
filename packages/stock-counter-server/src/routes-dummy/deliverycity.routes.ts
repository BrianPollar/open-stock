import express from 'express';
import { createMockDeliveryCity, createMockDeliveryCitys } from '../../../tests/stock-counter-mocks';

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
  res.status(200).send(createMockDeliveryCitys(Number(req.params.limit)));
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
