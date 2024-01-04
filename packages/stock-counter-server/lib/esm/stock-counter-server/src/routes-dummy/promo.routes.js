import express from 'express';
/**
 * Router for handling promo code routes.
 */
export const promocodeRoutesDummy = express.Router();
promocodeRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
promocodeRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({});
});
promocodeRoutesDummy.get('/getonebycode/:code/:companyIdParam', (req, res) => {
    res.status(200).send({});
});
promocodeRoutesDummy.get('/getall/:offset/:limit/:companyIdParam', (req, res) => {
    res.status(200).send([]);
});
promocodeRoutesDummy.delete('/deleteone/:id/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=promo.routes.js.map