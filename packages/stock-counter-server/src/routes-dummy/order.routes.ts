import express from 'express';
import { createMockOrder, createMockOrders } from '../../../tests/stock-counter-mocks';

/**
 * Express router for handling order routes.
 */
export const orderRoutesDummy = express.Router();

orderRoutesDummy.post('/makeorder/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

orderRoutesDummy.post('/paysubscription/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

orderRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

orderRoutesDummy.put('/update/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

orderRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
  res.status(200).send(createMockOrder());
});

orderRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
  res.status(200).send(createMockOrders(Number(req.params.limit)));
});

orderRoutesDummy.get('/getmyorders/:companyIdParam', (req, res) => {
  res.status(200).send(createMockOrders(10));
});

orderRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

orderRoutesDummy.put('/appendDelivery/:orderId/:status/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

orderRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
  res.status(200).send(createMockOrders(Number(req.params.limit)));
});

orderRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});
