import express from 'express';
import { createMockNotif, createMockNotifs } from '../../../tests/stock-notif-mocks';

/**
 * Router for handling notification routes.
 */
export const notifnRoutesDummy = express.Router();


notifnRoutesDummy.get('/getmynotifn/:companyIdParam', (req, res) => {
  res.status(200).send(createMockNotifs(10));
});

notifnRoutesDummy.get('/getmyavailnotifn/:companyIdParam', (req, res) => {
  res.status(200).send(createMockNotifs(10));
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

