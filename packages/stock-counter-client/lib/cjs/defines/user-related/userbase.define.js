"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBase = void 0;
const stock_auth_client_1 = require("@open-stock/stock-auth-client");
const stock_universal_1 = require("@open-stock/stock-universal");
class UserBase extends stock_universal_1.DatabaseAuto {
    constructor(data) {
        super(data);
        this.user = typeof data.user === 'string' ? data.user : new stock_auth_client_1.User(data.user);
        this.startDate = new Date(data.startDate);
        this.endDate = new Date(data.endDate);
        this.occupation = data.occupation;
        this.currency = data.currency;
    }
}
exports.UserBase = UserBase;
//# sourceMappingURL=userbase.define.js.map