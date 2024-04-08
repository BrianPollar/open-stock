"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailSender = void 0;
const rxjs_1 = require("rxjs");
const stock_notif_client_1 = require("../stock-notif-client");
class MailSender {
    constructor() { }
    static async sendMail(emailFrom, emailTo, subject, message) {
        const observer$ = stock_notif_client_1.StockNotifClient.ehttp
            .makePost('/mailsender/sendmail/', { emailFrom, emailTo, subject, message });
        const res = await (0, rxjs_1.lastValueFrom)(observer$);
        return res;
    }
}
exports.MailSender = MailSender;
//# sourceMappingURL=mail.define.js.map