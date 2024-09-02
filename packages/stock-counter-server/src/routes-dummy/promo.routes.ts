import { IdataArrayResponse } from '@open-stock/stock-universal';
import express from 'express';

/**
 * Router for handling promo code routes.
 */
export const promocodeRoutesDummy = express.Router();

promocodeRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

promocodeRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
  res.status(200).send({});
});

promocodeRoutesDummy.get('/getonebycode/:code/:companyIdParam', (req, res) => {
  res.status(200).send({ });
});

promocodeRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: []
  };

  res.status(200).send(response);
});

promocodeRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});
