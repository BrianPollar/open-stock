import express from 'express';

/**
 * Express router for pickup location routes
 */
export const pickupLocationRoutesDummy = express.Router();

pickupLocationRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

pickupLocationRoutesDummy.put('/update/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

pickupLocationRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
  res.status(200).send({});
});

pickupLocationRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
  res.status(200).send([]);
});

pickupLocationRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

pickupLocationRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
  res.status(200).send([]);
});

pickupLocationRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});
