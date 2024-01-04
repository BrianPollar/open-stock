"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localUserRoutesDummy = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
/** Express Router for local user routes. */
exports.localUserRoutesDummy = express_1.default.Router();
exports.localUserRoutesDummy.put('/deleteone/:companyIdParam', (req, res) => {
    return res.status(200).send({ success: true });
});
exports.localUserRoutesDummy.put('/deletemany/:companyIdParam', (req, res) => {
    return res.status(200).send({ success: true });
});
//# sourceMappingURL=locluser.routes.js.map