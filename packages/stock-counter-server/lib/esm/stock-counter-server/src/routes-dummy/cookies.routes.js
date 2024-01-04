import express from 'express';
/**
 * Express router for cookies routes.
 */
export const cookiesRoutesDummy = express.Router();
cookiesRoutesDummy.get('/getsettings', (req, res) => {
    res.status(200).send({ success: true });
});
cookiesRoutesDummy.put('/updatesettings', (req, res) => {
    res.status(200).send({ success: true });
});
cookiesRoutesDummy.put('/addcartitem', (req, res) => {
    res.status(200).send({ success: true });
});
cookiesRoutesDummy.put('/addrecentitem', (req, res) => {
    res.status(200).send({ success: true });
});
cookiesRoutesDummy.put('/deletecartitem/:id', (req, res) => {
    res.status(200).send({ success: true });
});
cookiesRoutesDummy.put('/clearcart', (req, res) => {
    res.status(200).send({ success: true });
});
cookiesRoutesDummy.get('/appendtocart', (req, res) => {
    res.status(200).send([]);
});
cookiesRoutesDummy.get('/appendtorecent', (req, res) => {
    res.status(200).send([]);
});
//# sourceMappingURL=cookies.routes.js.map