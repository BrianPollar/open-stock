import express from 'express';
/**
 * Router for handling mailPackage-related routes.
 */
export const mailSenderRoutesDummy = express.Router();
mailSenderRoutesDummy.post('/sendmail', (req, res) => {
    return res.status(200).send({ success: true, status: 200 });
});
//# sourceMappingURL=mail.routes.js.map