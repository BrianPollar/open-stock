import { User } from '@open-stock/stock-auth-client';
import {
  DatabaseAuto, IdataArrayResponse, IdeleteMany, Ifaq, Ifaqanswer, IfilterProps, Isuccess, Iuser
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';

export class Faq
  extends DatabaseAuto {
  urId: string;
  companyId: string;
  posterName: string;
  posterEmail: string;
  userId: string | User;
  qn: string;
  ans?: FaqAnswer[];
  approved: boolean;

  constructor(data: Ifaq) {
    super(data);
    this.urId = data.urId;
    this.companyId = data.companyId;
    this.posterName = data.posterName;
    this.posterEmail = data.posterEmail;
    this.createdAt = data.createdAt;
    this.approved = data.approved;
    if ((data.userId as Iuser)._id) {
      this.userId = new User(data.userId as Iuser);
    } else {
      this.userId = data.userId as string;
    }
    this.qn = data.qn;
  }

  static async getAll(offset = 0, limit = 20) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<Ifaq>>(`/faq/all/${offset}/${limit}`);
    const faqs = await lastValueFrom(observer$);

    return {
      count: faqs.count,
      faqs: faqs.data.map(val => new Faq(val)) };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<Ifaq>>('/faq/filter', filter);
    const faqs = await lastValueFrom(observer$);

    return {
      count: faqs.count,
      faqs: faqs.data.map(val => new Faq(val)) };
  }

  static async getOne(_id: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<Ifaq>(`/faq/one/${_id}`);
    const faq = await lastValueFrom(observer$) ;

    return new Faq(faq);
  }

  static add(faq: Ifaq) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>('/faq/add', faq);

    return lastValueFrom(observer$);
  }

  static removeMany(vals: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/faq/delete/many', vals);

    return lastValueFrom(observer$);
  }

  async changeApproved(approved: boolean) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>(`/faq/changeapproved/${this._id}`, {
        approved
      });
    const added = await lastValueFrom(observer$);

    if (added.success) {
      this.approved = approved;
    }

    return added;
  }

  remove() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete<Isuccess>(`/faq/delete/one/${this._id}`);

    return lastValueFrom(observer$);
  }
}


export class FaqAnswer
  extends DatabaseAuto {
  urId: string;
  companyId: string;
  faq: string;
  userId: User | string;
  ans: string;

  constructor(data: Ifaqanswer) {
    super(data);
    this.urId = data.urId;
    this.companyId = data.companyId;
    this.faq = data.faq;
    if ((data.userId as Iuser)._id) {
      this.userId = new User(data.userId as Iuser);
    } else {
      this.userId = data.userId as string;
    }
    this.ans = data.ans;
  }

  static async getAll(faq: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<Ifaqanswer>>(`/faq/getallans/${faq}`);
    const faqans = await lastValueFrom(observer$);

    return {
      count: faqans.count,
      faqans: faqans.data.map(val => new FaqAnswer(val)) };
  }

  static async getOne(_id: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<Ifaqanswer>(`/faq/one/${_id}`);
    const faqans = await lastValueFrom(observer$) ;

    return new FaqAnswer(faqans);
  }

  static async add(faq: Ifaqanswer) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>('/faq/createans', {
        faq
      });
    const added = await lastValueFrom(observer$);

    return added;
  }

  remove() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete<Isuccess>(`/faq/deleteoneans/${this._id}`);

    return lastValueFrom(observer$);
  }
}

