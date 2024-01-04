import express from 'express';
import { createMockItemOffer, createMockItemOffers } from '../../../tests/stock-counter-mocks';
/**
 * Router for item offers.
 */
export const itemOfferRoutesDummy = express.Router();
itemOfferRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
itemOfferRoutesDummy.get('/getall/:type/:offset/:limit/:companyIdParam', (req, res) => {
    res.status(200).send(createMockItemOffers(Number(req.params.limit)));
});
itemOfferRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send(createMockItemOffer());
});
itemOfferRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
itemOfferRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=itemoffer.routes.js.map