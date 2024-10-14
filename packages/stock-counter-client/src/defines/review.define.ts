import { User } from '@open-stock/stock-auth-client';
import {
  DatabaseAuto, IdataArrayResponse, IfilterProps, IreviewMain, Isuccess, Iuser
} from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';

export class Review extends DatabaseAuto {
  urId: string;
  companyId?: string;
  image?: string;
  name: string;
  email: string;
  comment: string;
  rating: number;
  images?: string[];
  userId: User | string;
  itemId: string;

  constructor(data: IreviewMain) {
    super(data);
    this.urId = data.urId;
    this.companyId = data.companyId;
    this.image = data.image;
    this.name = data.name;
    this.email = data.email;
    this.comment = data.comment;
    this.rating = data.rating;
    this.images = data.images;
    if (data.userId) {
      this.userId = new User(data.userId as Iuser);
    } else {
      this.userId = data.userId ;
    }
    this.itemId = data.itemId;
  }

  static async getAll(
    itemId: string, // TODO
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IdataArrayResponse<IreviewMain>>(`/review/all/${itemId}/${offset}/${limit}`);
    const reviews = await lastValueFrom(observer$);

    return {
      count: reviews.count,
      reviews: reviews.data.map(val => new Review(val)) };
  }

  static async filterAll(filter: IfilterProps) {
    const observer$ = StockCounterClient.ehttp
      .makePost<IdataArrayResponse<IreviewMain>>('/review/filter', filter);
    const reviews = await lastValueFrom(observer$);

    return {
      count: reviews.count,
      reviews: reviews.data.map(val => new Review(val)) };
  }

  static async getRatingCount(
    _id: string,
    rating: number// 0 - 10
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<{ count: number }>(`/review/getratingcount/${_id}/${rating}`);
    const count = await lastValueFrom(observer$);

    return count;
  }

  static async getOne(urIdOr_id: string) {
    const observer$ = StockCounterClient.ehttp
      .makeGet<IreviewMain>(`/review/one/${urIdOr_id}`);
    const review = await lastValueFrom(observer$);

    return new Review(review);
  }

  static async add(review: IreviewMain) {
    const observer$ = StockCounterClient.ehttp
      .makePost<Isuccess>('/review/add', review);
    const added = await lastValueFrom(observer$);

    return added;
  }

  remove() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete<Isuccess>(`/review/delete/one/${this._id}/${this.itemId}/${this.rating}`);

    return lastValueFrom(observer$);
  }
}
