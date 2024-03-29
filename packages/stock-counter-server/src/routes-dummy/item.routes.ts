import { IdataArrayResponse } from '@open-stock/stock-universal';
import express from 'express';
import {
  createMockItem,
  createMockItemOffers,
  createMockItems,
  createMockSponsoreds
} from '../../../tests/stock-counter-mocks';

/**
 * Express router for item routes.
 */
export const itemRoutesDummy = express.Router();

itemRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

itemRoutesDummy.put('/update/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

itemRoutesDummy.post('/updateimg/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

itemRoutesDummy.put('/like/:itemId/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

itemRoutesDummy.put('/unlike/:itemId/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

itemRoutesDummy.get('/getone/:urId/:companyIdParam', (req, res) => {
  res.status(200).send(createMockItem());
});

itemRoutesDummy.get('/filtergeneral/:prop/:val/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockItems(Number(req.params.limit))
  };
  res.status(200).send(response);
});

itemRoutesDummy.get('/filterrandom/:prop/:val/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockItems(Number(req.params.limit))
  };
  res.status(200).send(response);
});

itemRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockItems(Number(req.params.limit))
  };
  res.status(200).send(response);
});

itemRoutesDummy.get('/gettrending/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockItems(Number(req.params.limit))
  };
  res.status(200).send(response);
});

// newly posted
itemRoutesDummy.get('/getnew/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockItems(Number(req.params.limit))
  };
  res.status(200).send(response);
});

// new not used
itemRoutesDummy.get('/getbrandnew/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockItems(Number(req.params.limit))
  };
  res.status(200).send(response);
});

// new not used
itemRoutesDummy.get('/getused/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockItems(Number(req.params.limit))
  };
  res.status(200).send(response);
});

// filterprice
itemRoutesDummy.get('/filterprice/max/:priceFilterValue/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockItems(Number(req.params.limit))
  };
  res.status(200).send(response);
});

itemRoutesDummy.get('/filterprice/min/:priceFilterValue/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockItems(Number(req.params.limit))
  };
  res.status(200).send(response);
});


itemRoutesDummy.get('/filterprice/eq/:priceFilterMinValue/:priceFilterMaxValue/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockItems(Number(req.params.limit))
  };
  res.status(200).send(response);
});

itemRoutesDummy.get('/filterstars/:starVal/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockItems(Number(req.params.limit))
  };
  res.status(200).send(response);
});

itemRoutesDummy.get('/discount/:discountValue/:offset/:limit/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockItems(Number(req.params.limit))
  };
  res.status(200).send(response);
});

itemRoutesDummy.post('/getsponsored/:companyIdParam', (req, res) => {
  res.status(200).send(createMockSponsoreds(10));
});

itemRoutesDummy.get('/getoffered/:companyIdParam', (req, res) => {
  res.status(200).send(createMockItemOffers(10));
});

itemRoutesDummy.put('/addsponsored/:id/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

itemRoutesDummy.put('/updatesponsored/:id/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

itemRoutesDummy.delete('/deletesponsored/:id/:spnsdId/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

itemRoutesDummy.put('/deleteone/:id/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

itemRoutesDummy.put('/deleteimages/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

itemRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
  const response: IdataArrayResponse = {
    count: req.params.limit,
    data: createMockItems(Number(req.params.limit))
  };
  res.status(200).send(response);
});

itemRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});
