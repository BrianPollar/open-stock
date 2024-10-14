import {
  DatabaseAuto, Iaddress, Ibilling, Icompany,
  IdataArrayResponse, IdeleteMany, IdeleteOne, Ifile, IfileMeta, IfilterProps,
  Isuccess, Iuser, Iuserperm, TuserDispNameFormat, TuserType
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockAuthClient } from '../stock-auth-client';
import { Company } from './company.define';

export class User
  extends DatabaseAuto {
  static routeUrl: string;
  urId: string;
  companyId: Company;
  names: string;
  fname: string;
  lname: string;
  companyName: string;
  email: string;
  address: Iaddress[] = [];
  billing: Ibilling[] = [];
  uid: string;
  did: string;
  aid: string;
  photos: IfileMeta[];
  profilePic: IfileMeta;
  profileCoverPic: IfileMeta;
  permissions: Iuserperm = {
    companyAdminAccess: false
  };

  phone: number;
  amountDue = 0;
  readonly currency?: string;
  manuallyAdded: boolean;
  online = false;
  salutation: string;
  extraCompanyDetails: string;
  userDispNameFormat: TuserDispNameFormat = 'firstLast';
  userType?: TuserType;
  verified: boolean;

  constructor(data: Iuser) {
    super(data);
    this.appendUpdate(data);
    this.currency = data.currency;
  }

  static async existsEmailOrPhone(emailPhone: string) {
    const observer$ = StockAuthClient.ehttp.makeGet<{ exists: boolean }>(`/user/existsemailphone/${emailPhone}`);
    const response = await lastValueFrom(observer$);

    return response.exists;
  }

  static async getAll(offset = 0, limit = 20) {
    const observer$ = StockAuthClient
      .ehttp.makeGet<IdataArrayResponse<Iuser>>(`/user/all/${offset}/${limit}`);
    const users = await lastValueFrom(observer$);

    return {
      count: users.count,
      users: users.data.map(val => new User(val))
    };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockAuthClient.ehttp.makePost<IdataArrayResponse<Iuser>>('/user/filter', filter);
    const users = await lastValueFrom(observer$);

    return {
      count: users.count,
      users: users.data.map(val => new User(val))
    };
  }

  static async getOne(urId: string) {
    const observer$ = StockAuthClient.ehttp.makeGet<Iuser>(`/user/one/${urId}`);
    const user = await lastValueFrom(observer$);

    return new User(user);
  }

  static async add(user: Partial<Iuser>, files?: Ifile[]) {
    const body = {
      user
    };
    let added: Isuccess;

    if (files && files[0]) {
      const observer$ = StockAuthClient.ehttp.uploadFiles<Isuccess>(files, '/user/add/img', body);

      added = await lastValueFrom(observer$);
    } else {
      const observer$ = StockAuthClient.ehttp.makePost<Isuccess>('/user/add', body);

      added = await lastValueFrom(observer$);
    }

    return added;
  }

  static removeMany(vals: IdeleteMany) {
    const observer$ = StockAuthClient.ehttp.makePut<Isuccess>('/user/delete/many', vals);

    return lastValueFrom(observer$);
  }

  async update(vals: Partial<Iuser>, files?: Ifile[]) {
    const details = {
      user: {
        ...vals,
        _id: this._id
      }
    };
    let updated: Isuccess;

    if (files && files[0]) {
      const observer$ = StockAuthClient
        .ehttp.uploadFiles<Isuccess>(files, '/user/update/img', details);

      updated = await lastValueFrom(observer$);
    } else {
      const observer$ = StockAuthClient.ehttp.makePut<Isuccess>('/user/update', details);

      updated = await lastValueFrom(observer$);
    }

    return updated;
  }

  async modifyPermissions(permissions: Iuserperm) {
    const observer$ = StockAuthClient.ehttp
      .makePut<Isuccess>(`/user/updatepermissions/${this._id}`, permissions);
    const updated = await lastValueFrom(observer$);

    this.permissions = permissions;

    return updated;
  }

  async remove() {
    const observer$ = StockAuthClient.ehttp
      .makePut<Isuccess>(
        '/user/delete/one',
        {
          _id: this._id
        } as IdeleteOne
      );
    const deleted = await lastValueFrom(observer$);

    return deleted;
  }

  async removeImages(filesWithDir: IfileMeta[]) {
    const observer$ = StockAuthClient.ehttp
      .makePut<Isuccess>('/user/delete/images', { filesWithDir, user: { _id: this._id } });
    const deleted = await lastValueFrom(observer$);
    const toStrings = filesWithDir.map(val => val._id);

    this.photos = this.photos.filter(val => !toStrings.includes(val._id));

    return deleted;
  }

  appendUpdate(data: Iuser) {
    if (data) {
      this.urId = data.urId;
      if (data.companyId) {
        this.companyId = new Company(data.companyId as Icompany);
      }
      this.fname = data.fname || this.fname;
      this.lname = data.lname || this.lname;
      this.companyName = data.companyName || this.companyName;
      this.email = data.email || this.email;
      this.address = data.address || this.address;
      this.billing = data.billing || this.billing;
      this.uid = data.uid || this.uid;
      this.did = data.did || this.did;
      this.aid = data.aid || this.aid;
      this.photos = data.photos as IfileMeta[] || this.photos;
      this.profilePic = data.profilePic as IfileMeta || this.profilePic;
      this.profileCoverPic = data.profileCoverPic as IfileMeta || this.profileCoverPic;
      this.permissions = data.permissions || this.permissions;
      this.phone = data.phone || this.phone;
      this.amountDue = data.amountDue || this.amountDue;
      this.manuallyAdded = data.manuallyAdded;
      this.names = this.fname + ' ' + this.lname;
      this.salutation = data.salutation || this.salutation;
      this.extraCompanyDetails = data.extraCompanyDetails || this.extraCompanyDetails;
      this.userDispNameFormat = data.userDispNameFormat || this.userDispNameFormat;
      this.userType = data.userType || this.userType;
      this.verified = data.verified || this.verified;
    }
  }
}

