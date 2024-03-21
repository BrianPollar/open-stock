export declare class MailSender {
    constructor();
    static sendMail(emailFrom: string, emailTo: string, subject: string, message: string): Promise<unknown>;
}
