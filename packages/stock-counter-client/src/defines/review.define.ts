/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto, IreviewMain, Isuccess, Iuser } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';

/** */
/**
 * Represents a review object.
 */
export class Review extends DatabaseAuto {
  /** The user ID associated with the review. */
  urId: string;

  /** The image associated with the review. */
  image: string;

  /** The name of the user who left the review. */
  name: string;

  /** The email of the user who left the review. */
  email: string;

  /** The comment left by the user. */
  comment: string;

  /** The rating given by the user. */
  rating: number;

  /** An array of images associated with the review. */
  images: string[];

  /** The user ID associated with the review. */
  userId: User | string;

  /** The ID of the item being reviewed. */
  itemId: string;

  /**
   * Creates a new Review object.
   * @param data An object containing the data for the review.
   */
  constructor(data: IreviewMain) {
    super(data);
    this.urId = data.urId;
    this.image = data.image;
    this.name = data.name;
    this.email = data.email;
    this.comment = data.comment;
    this.rating = data.rating;
    this.images = data.images;
    if (data.userId) {
      this.userId = new User(data.userId as Iuser);
    } else {
      this.userId = data.userId as string;
    }
    this.itemId = data.itemId;
  }

  /**
   * Gets all reviews for a given item.
   * @param itemId The ID of the item to get reviews for.
   * @param url The URL to use for the request. Defaults to 'getall'.
   * @param offset The offset to use for the request. Defaults to 0.
   * @param limit The limit to use for the request. Defaults to 0.
   * @returns An array of Review objects.
   */
  static async getreviews(
    itemId: string,
    url = 'getall',
    offset = 0,
    limit = 0
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/review/${url}/${itemId}/${offset}/${limit}`);
    const reviews = await lastValueFrom(observer$) as IreviewMain[];
    return reviews.map(val => new Review(val));
  }

  /**
   * Gets a single review by ID.
   * @param id The ID of the review to get.
   * @returns A Review object.
   */
  static async getOnereview(
    id: string
  ) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/review/getone/${id}`);
    const review = await lastValueFrom(observer$) as IreviewMain;
    return new Review(review);
  }

  /**
   * Creates a new review.
   * @param review An object containing the data for the new review.
   * @returns An object indicating whether the operation was successful.
   */
  static async createreview(
    review: IreviewMain
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePost('/review/create', {
        review
      });
    const added = await lastValueFrom(observer$) as Isuccess;
    return added;
  }

  /**
   * Deletes the current review.
   * @returns An object indicating whether the operation was successful.
   */
  async deleteReview() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete(`/review/deleteone/${this._id}/${this.itemId}/${this.rating}`);
    return await lastValueFrom(observer$) as Isuccess;
  }
}
