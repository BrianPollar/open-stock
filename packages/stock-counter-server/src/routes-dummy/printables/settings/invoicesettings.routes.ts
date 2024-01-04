import express from 'express';
import { appendBody, deleteFiles, saveMetaToDb, uploadFiles } from '@open-stock/stock-universal-server';
import { createMockInvoiceSettings } from '../../../../../tests/stock-counter-mocks';

/**
 * Router for invoice settings.
 */
export const invoiceSettingRoutesDummy = express.Router();

invoiceSettingRoutesDummy.post('/create/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

invoiceSettingRoutesDummy.post('/createimg/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

invoiceSettingRoutesDummy.put('/update/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});


invoiceSettingRoutesDummy.put('/updateimg/:companyIdParam', uploadFiles, appendBody, saveMetaToDb, deleteFiles, (req, res) => {
  res.status(200).send({ success: true });
});

invoiceSettingRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
  res.status(200).send(createMockInvoiceSettings());
});

invoiceSettingRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
  res.status(200).send([createMockInvoiceSettings()]);
});

invoiceSettingRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});

invoiceSettingRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
  res.status(200).send([createMockInvoiceSettings()]);
});

invoiceSettingRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
  res.status(200).send({ success: true });
});
