/* eslint-disable @typescript-eslint/no-misused-promises */
import express from 'express';
import { createMockStaff, createMockStaffs } from '../../../../tests/stock-counter-mocks';
/**
 * Router for staff related routes.
 */
export const staffRoutesDummy = express.Router();
staffRoutesDummy.post('/create/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
staffRoutesDummy.get('/getone/:id/:companyIdParam', (req, res) => {
    res.status(200).send(createMockStaff());
});
staffRoutesDummy.get('/getbyrole/:offset/:limit/:role/:companyIdParam', (req, res) => {
    res.status(200).send(createMockStaffs(Number(req.params.limit)));
});
staffRoutesDummy.post('/search/:limit/:offset/:companyIdParam', (req, res) => {
    res.status(200).send(createMockStaffs(Number(req.params.limit)));
});
staffRoutesDummy.put('/update/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
staffRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
staffRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=staff.routes.js.map