"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailSenderRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
/**
 * Router for handling mailPackage-related routes.
 */
exports.mailSenderRoutesDummy = express_1.default.Router();
exports.mailSenderRoutesDummy.post('/sendmail', (req, res) => {
    return res.status(200).send({ success: true, status: 200 });
});
//# sourceMappingURL=mail.routes.js.map