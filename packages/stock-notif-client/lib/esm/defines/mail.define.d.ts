import { Isuccess } from '@open-stock/stock-universal';
export declare class MailSender {
    constructor();
    static sendMail(emailFrom: string, emailTo: string, subject: string, message: string): Promise<Isuccess>;
}
