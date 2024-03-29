/* eslint-disable @typescript-eslint/no-misused-promises */
import { IdataArrayResponse } from '@open-stock/stock-universal';
import express from 'express';
import { createMockStaff, createMockStaffs } from '../../../../tests/stock-counter-mocks';

/**
 * Router for staff related routes.
 */
export const staffRoutesDummy = express.Router();

staffRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

staffRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
  res.status(200).send(createMockStaff());
});

staffRoutesDummy.get('/getall/:offset/:limit/:role/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockStaffs(Number(req.params.limit))
  };
  res.status(200).send(response);
});

staffRoutesDummy.get('/getbyrole/:offset/:limit/:role/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockStaffs(Number(req.params.limit))
  };
  res.status(200).send(response);
});

staffRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockStaffs(Number(req.params.limit))
  };
  res.status(200).send(response);
});

staffRoutesDummy.put('/update/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

staffRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

staffRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});


