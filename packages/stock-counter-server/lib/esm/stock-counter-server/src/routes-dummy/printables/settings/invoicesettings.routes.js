import express from 'express';
import { createMockInvoiceSettings } from '../../../../../mocks/stock-counter-mocks';
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
invoiceSettingRoutesDummy.put('/updateimg/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
invoiceSettingRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send(createMockInvoiceSettings());
});
invoiceSettingRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: [createMockInvoiceSettings()]
    };
    res.status(200).send(response);
});
invoiceSettingRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
invoiceSettingRoutesDummy.post('/search/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: [createMockInvoiceSettings()]
    };
    res.status(200).send(response);
});
invoiceSettingRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=invoicesettings.routes.js.map