import { Isuccess } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockNotifClient } from '../stock-notif-client';

export class MailSender {
  constructor() {}

  static async sendMail(
    emailFrom: string,
    emailTo: string,
    subject: string,
    message: string
  ) {
    const observer$ = StockNotifClient.ehttp
      .makePost('/mailsender/sendmail/', { emailFrom, emailTo, subject, message });
    const res = await lastValueFrom(observer$) as Isuccess;
    return res;
  }
}
