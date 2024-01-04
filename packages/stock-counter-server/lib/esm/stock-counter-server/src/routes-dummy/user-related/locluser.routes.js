import express from 'express';
/** Express Router for local user routes. */
export const localUserRoutesDummy = express.Router();
localUserRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    return res.status(200).send({ success: true });
});
localUserRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=locluser.routes.js.map