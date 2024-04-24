import { IdataArrayResponse } from '@open-stock/stock-universal';
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
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockOrders(Number(req.params.limit))
  };
  res.status(200).send(response);
});

orderRoutesDummy.get('/getmyorders/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockOrders(10)
  };
  res.status(200).send(response);
});

orderRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

orderRoutesDummy.put('/appendDelivery/:orderId/:status/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

orderRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockOrders(Number(req.params.limit))
  };
  res.status(200).send(response);
});

orderRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});
