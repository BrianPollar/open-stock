"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * This module exports the Universal Controller.
 * @module UniversalController
 */
tslib_1.__exportStar(require("./controllers/auth.controller"), exports);
tslib_1.__exportStar(require("./controllers/universial.controller"), exports);
tslib_1.__exportStar(require("./models/company.model"), exports);
tslib_1.__exportStar(require("./models/emailtoken.model"), exports);
tslib_1.__exportStar(require("./models/user.model"), exports);
tslib_1.__exportStar(require("./routes/company-auth"), exports);
tslib_1.__exportStar(require("./routes/company.routes"), exports);
tslib_1.__exportStar(require("./routes/subscriptions/company-subscription.routes"), exports);
tslib_1.__exportStar(require("./routes/subscriptions/subscription-package.routes"), exports);
tslib_1.__exportStar(require("./routes/user.routes"), exports);
tslib_1.__exportStar(require("./stock-auth-server"), exports);
//# sourceMappingURL=index.js.map