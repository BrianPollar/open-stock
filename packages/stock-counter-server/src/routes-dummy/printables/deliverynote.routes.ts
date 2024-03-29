/* eslint-disable @typescript-eslint/no-misused-promises */

import { IdataArrayResponse } from '@open-stock/stock-universal';
import express from 'express';
import { createMockDeliverynote, createMockDeliverynotes } from '../../../../tests/stock-counter-mocks';

/**
 * Express router for delivery note routes.
 */
export const deliveryNoteRoutesDummy = express.Router();

deliveryNoteRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});


deliveryNoteRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
  res.status(200).send(createMockDeliverynote());
});

deliveryNoteRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockDeliverynotes(Number(req.params.limit))
  };
  res.status(200).send(response);
});

deliveryNoteRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

deliveryNoteRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockDeliverynotes(Number(req.params.limit))
  };
  res.status(200).send(response);
});

deliveryNoteRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

