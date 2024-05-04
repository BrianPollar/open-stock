import { IdataArrayResponse } from '@open-stock/stock-universal';
import express from 'express';
import { createMockNotif, createMockNotifs } from '../../../mocks/stock-notif-mocks';

/**
 * Router for handling notification routes.
 */
export const notifnRoutesDummy = express.Router();

notifnRoutesDummy.get('/getmynotifn/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: 10,
    data: createMockNotifs(10)
  };
  res.status(200).send(response);
});

notifnRoutesDummy.get('/getmyavailnotifn/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: 10,
    data: createMockNotifs(10)
  };
  res.status(200).send(response);
});

notifnRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
  res.status(200).send(createMockNotif());
});

notifnRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

notifnRoutesDummy.post('/subscription/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

notifnRoutesDummy.post('/updateviewed/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

notifnRoutesDummy.get('/unviewedlength/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

notifnRoutesDummy.put('/clearall/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});


// settings
notifnRoutesDummy.post('/createstn/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

notifnRoutesDummy.put('/updatestn', (req, res) => {
  res.status(200).send({ success: true });
});

// settings
notifnRoutesDummy.post('/getstn', (req, res) => {
  res.status(200).send([]);
});
