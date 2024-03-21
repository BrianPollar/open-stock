import { lastValueFrom } from 'rxjs';
import { StockNotifClient } from '../stock-notif-client';
export class MailSender {
    constructor() { }
    static async sendMail(emailFrom, emailTo, subject, message) {
        const observer$ = StockNotifClient.ehttp
            .makePost('/mailsender/sendmail/', { emailFrom, emailTo, subject, message });
        const res = await lastValueFrom(observer$);
        return res;
    }
}
//# sourceMappingURL=mail.define.js.map