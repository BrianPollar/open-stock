import { lastValueFrom } from 'rxjs';
import { StockNotifClient } from '../stock-notif-client';

export class MailSender {
  constructor() {}

  static async getCompanySubscriptions(
    emailFrom: string,
    emailTo: string,
    subject: string,
    message: string
  ) {
    const observer$ = StockNotifClient.ehttp
      .makePost('/mailsender/sendmail/', { emailFrom, emailTo, subject, message });
    const res = await lastValueFrom(observer$) ;
    return res;
  }
}
