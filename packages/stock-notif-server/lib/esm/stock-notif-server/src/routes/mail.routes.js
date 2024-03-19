import { requireAuth, roleAuthorisation } from '@open-stock/stock-universal-server';
import express from 'express';
import { getLogger } from 'log4js';
/** Logger for mailPackage routes */
const mailPackageRoutesLogger = getLogger('routes/mailPackageRoutes');
/**
 * Router for handling mailPackage-related routes.
 */
export const mailPackageRoutes = express.Router();
mailPackageRoutes.post('/sendmail', requireAuth, roleAuthorisation('users', 'create'), (req, res) => {
    return res.status(200).send({ success: true, status: 200 });
});
//# sourceMappingURL=mail.routes.js.map