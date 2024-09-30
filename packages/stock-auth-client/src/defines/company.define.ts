
import {
  DatabaseAuto,
  IblockedReasons,
  Icompany, IdataArrayResponse,
  IdeleteMany,
  IdeleteOne,
  IeditCompany, Ifile, IfilterProps, Isuccess
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockAuthClient } from '../stock-auth-client';
import { User } from './user.define';

export class Company
  extends DatabaseAuto {
  urId: string;
  name: string;
  displayName: string;
  dateOfEst: string;
  address: string;
  details: string;
  businessType: string;
  websiteAddress: string;
  blockedReasons: IblockedReasons;
  left: boolean;
  dateLeft: Date;
  blocked: boolean;
  verified: boolean;
  owner: User | string;

  constructor(data: Icompany) {
    super(data);
    this.appendUpdate(data);
  }

  static async getAll(offset = 0, limit = 20) {
    const observer$ = StockAuthClient
      .ehttp.makeGet<IdataArrayResponse<Icompany>>(`/company/all/${offset}/${limit}`);
    const companys = await lastValueFrom(observer$);

    return {
      count: companys.count,
      companys: companys.data.map(val => new Company(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockAuthClient
      .ehttp.makePost<IdataArrayResponse<Icompany>>('/company/filter', filter);
    const companys = await lastValueFrom(observer$);

    return {
      count: companys.count,
      companys: companys.data.map(val => new Company(val))
    };
  }

  static async getOne(_id: string) {
    const observer$ = StockAuthClient.ehttp.makeGet<Icompany>(`/company/one/${_id}`);
    const company = await lastValueFrom(observer$);

    return new Company(company);
  }


  static async add(vals: IeditCompany) {
    const observer$ = StockAuthClient.ehttp.makePost<Isuccess>('/company/add', vals);
    const added = await lastValueFrom(observer$);

    return added;
  }

  static deleteCompanys(vals: IdeleteMany) {
    const observer$ = StockAuthClient
      .ehttp.makePut<Isuccess>('/company/delete/many', vals);

    return lastValueFrom(observer$);
  }

  async update(
    vals: IeditCompany,
    files?: Ifile[]
  ) {
    vals.company._id = this._id;
    let updated: Isuccess;

    if (files && files.length > 0) {
      const observer$ = StockAuthClient.ehttp
        .uploadFiles<Isuccess>(files, '/company/update/img', vals);

      updated = await lastValueFrom(observer$);
    } else {
      const observer$ = StockAuthClient.ehttp.makePut<Isuccess>('/company/update', vals);

      updated = await lastValueFrom(observer$);
    }

    return updated;
  }

  async remove() {
    const observer$ = StockAuthClient.ehttp
      .makePut<Isuccess>(
        '/company/delete/one',
        {
          _id: this._id
        } as IdeleteOne
      );
    const deleted = await lastValueFrom(observer$);

    return deleted;
  }

  appendUpdate(data: Icompany) {
    if (data) {
      this.urId = data.urId || this.urId;
      this.name = data.name || this.name;
      this.displayName = data.displayName || this.displayName;
      this.dateOfEst = data.dateOfEst || this.dateOfEst;
      this.details = data.details || this.details;
      this.businessType = data.businessType || this.businessType;
      this.websiteAddress = data.websiteAddress || this.websiteAddress;
      this.blockedReasons = data.blockedReasons || this.blockedReasons;
      this.left = data.left || this.left;
      this.dateLeft = data.dateLeft || this.dateLeft;
      this.blocked = data.blocked || this.blocked;
      this.verified = data.verified || this.verified;
      this.address = data.address || this.address;
      this.owner = typeof data.owner === 'object' ? new User(data.owner) : data.owner;
    }
  }
}
