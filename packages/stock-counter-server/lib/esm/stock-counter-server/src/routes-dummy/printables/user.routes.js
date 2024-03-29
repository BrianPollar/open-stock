import express from 'express';
// import { notifConfig } from '../../config/notif.config';
// import { createNotifications, NotificationController } from '../controllers/notifications.controller';
/**
 * Router for authentication routes.
 */
export const authRoutesDummy = express.Router();
authRoutesDummy.get('/authexpress/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.post('/login', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.post('/signup', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.post('recover', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.post('/confirm', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.put('/resetpaswd', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.post('/manuallyverify/:userId/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.post('/sociallogin', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.put('/updateprofile/:formtype/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.post('/updateprofileimg/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.put('/updatepermissions/:userId/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.put('/blockunblock/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.put('/addupdateaddr/:userId/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.get('/getoneuser/:urId/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.get('/getusers/:where/:offset/:limit/:companyIdParam', (req, res) => {
    const response = {
        count: req.params.limit,
        data: []
    };
    res.status(200).send(response);
});
authRoutesDummy.post('/adduser/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.post('/adduserimg/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.put('/updateuserbulk/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.post('/updateuserbulkimg/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
authRoutesDummy.put('/deleteimages/:companyIdParam', (req, res) => {
    res.status(200).send({ success: true });
});
//# sourceMappingURL=user.routes.js.map