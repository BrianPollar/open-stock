import {
  IdataArrayResponse,
  IdeleteMany, IdeleteOne, IeditStaff,
  Ifile, IfilterProps,
  Isalary,
  Istaff,
  IsubscriptionFeatureState,
  Isuccess
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../../stock-counter-client';
import { UserBase } from './userbase.define';

interface IgetOneFilter {
  _id?: string;
  userId?: string;
  companyId?: string;
}

export class Staff
  extends UserBase {
  employmentType: string;
  salary: Isalary;

  constructor(data: Istaff) {
    super(data);
    this.employmentType = data.employmentType;
    this.salary = data.salary;
  }

  static async getAll(offset = 0, limit = 20) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<Istaff>>(`/staff/all/${offset}/${limit}`);
    const staffs = await lastValueFrom(observer$);

    return {
      count: staffs.count,
      staffs: staffs.data.map(val => new Staff(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<Istaff>>('/staff/filter', filter);
    const staffs = await lastValueFrom(observer$);

    return {
      count: staffs.count,
      staffs: staffs.data.map(val => new Staff(val))
    };
  }

  static async getByRole(role: string, offset = 0, limit = 20) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<Istaff>>(`/staff/getbyrole/${offset}/${limit}/${role}`);
    const staffs = await lastValueFrom(observer$);

    return {
      count: staffs.count,
      staffs: staffs.data.map(val => new Staff(val))
    };
  }

  static async getOne(filter: IgetOneFilter) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Istaff>('/staff/one', filter);
    const staff = await lastValueFrom(observer$);

    return new Staff(staff);
  }

  static async add(vals: IeditStaff, files?: Ifile[]) {
    let added: IsubscriptionFeatureState;

    vals.user.userType = 'staff';
    if (files && files[0]) {
      const observer$ = StockCounterClient.ehttp
        .uploadFiles<IsubscriptionFeatureState>(files, '/staff/add/img', vals);

      added = await lastValueFrom(observer$) ;
    } else {
      const observer$ = StockCounterClient.ehttp
        .makePost<IsubscriptionFeatureState>('/staff/add', vals);

      added = await lastValueFrom(observer$) ;
    }

    return added;
  }

  static removeMany(vals: IdeleteMany) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/staff/delete/many', vals);

    return lastValueFrom(observer$);
  }

  async update(vals: IeditStaff, files: Ifile[]) {
    let updated: Isuccess;

    vals.staff._id = this._id;
    vals.user._id = typeof this.user === 'string' ? this.user : this.user._id;
    if (files && files[0]) {
      const observer$ = StockCounterClient.ehttp.uploadFiles<Isuccess>(files, '/staff/update/img', vals);

      updated = await lastValueFrom(observer$);
    } else {
      const observer$ = StockCounterClient.ehttp
        .makePut<Isuccess>('/staff/update', vals);

      updated = await lastValueFrom(observer$);
    }

    if (updated.success) {
      this.employmentType = vals.staff.employmentType || this.employmentType;
      this.salary = vals.staff.salary || this.salary;
    }

    return updated;
  }

  remove(val: IdeleteOne) {
    const observer$ = StockCounterClient.ehttp
      .makePut<Isuccess>('/staff/delete/one', val);

    return lastValueFrom(observer$);
  }
}
