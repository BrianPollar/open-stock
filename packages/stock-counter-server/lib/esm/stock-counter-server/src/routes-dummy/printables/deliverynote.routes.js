/* eslint-disable @typescript-eslint/no-misused-promises */
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
    res.status(200).send(createMockDeliverynotes(Number(req.params.limit)));
});
deliveryNoteRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
deliveryNoteRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
    res.status(200).send(createMockDeliverynotes(Number(req.params.limit)));
});
deliveryNoteRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=deliverynote.routes.js.map