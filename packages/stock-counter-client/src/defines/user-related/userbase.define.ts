import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto, Icustomer, Istaff, Iuser } from '@open-stock/stock-universal';

export abstract class UserBase
  extends DatabaseAuto {
  user: string | User;
  startDate: Date;
  endDate: Date;
  occupation: string;
  readonly currency?: string;

  constructor(data: {
    user: string | Iuser;
    startDate: string;
    endDate: string;
    occupation: string;
    currency?: string;
  } | Icustomer | Istaff) {
    super(data);
    this.user = typeof data.user === 'string' ? data.user : new User(data.user);
    this.startDate = new Date(data.startDate);
    this.endDate = new Date(data.endDate);
    this.occupation = data.occupation;
    this.currency = data.currency;
  }
}
