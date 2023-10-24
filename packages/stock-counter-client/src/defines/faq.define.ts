/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto, Ifaq, Ifaqanswer, Isuccess, Iuser } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';

/** The  Faq  class represents a FAQ object. It extends the  DatabaseAuto  class and includes properties such as  urId ,  posterName ,  posterEmail ,  userId ,  qn ,  ans , and  approved . It also includes methods for retrieving FAQs, creating a new FAQ, deleting FAQs, changing the approval status of a FAQ, and deleting a FAQ. */
/**
 * Represents a frequently asked question (FAQ) in the system.
 */
export class Faq extends DatabaseAuto {
  /** The unique identifier of the user who created the FAQ. */
  urId: string;

  /** The name of the user who created the FAQ. */
  posterName: string;

  /** The email of the user who created the FAQ. */
  posterEmail: string;

  /** The unique identifier or the user object of the user who created the FAQ. */
  userId: string | User;

  /** The question of the FAQ. */
  qn: string;

  /** The answers to the FAQ. */
  ans?: FaqAnswer[];

  /** Indicates whether the FAQ is approved or not. */
  approved: boolean;

  /**
   * Creates a new instance of the Faq class.
   * @param data The data to initialize the instance with.
   */
  constructor(data: Ifaq) {
    super(data);
    this.urId = data.urId;
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

  /**
   * Retrieves all FAQs from the server.
   * @param url The URL to retrieve the FAQs from.
   * @param offset The offset to start retrieving FAQs from.
   * @param limit The maximum number of FAQs to retrieve.
   * @returns An array of Faq instances.
   */
  static async getFaqs(url = 'getall', offset = 0, limit = 0) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/faq/${url}/${offset}/${limit}`);
    const faqs = await lastValueFrom(observer$) as Ifaq[];
    return faqs.map(val => new Faq(val));
  }

  /**
   * Retrieves a single FAQ from the server.
   * @param id The unique identifier of the FAQ to retrieve.
   * @returns A Faq instance.
   */
  static async getOnefaq(id: string) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/faq/getone/${id}`);
    const faq = await lastValueFrom(observer$) as Ifaq;
    return new Faq(faq);
  }

  /**
   * Creates a new FAQ on the server.
   * @param faq The FAQ to create.
   * @returns An object indicating whether the operation was successful or not.
   */
  static async createfaq(faq: Ifaq) {
    const observer$ = StockCounterClient.ehttp
      .makePost('/faq/create', {
        faq
      });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Deletes multiple FAQs from the server.
   * @param ids The unique identifiers of the FAQs to delete.
   * @returns An object indicating whether the operation was successful or not.
   */
  static async deleteFaqs(ids: string[]) {
    const observer$ = StockCounterClient.ehttp
      .makePut('/faq/deletemany', { ids });
    return await lastValueFrom(observer$) as Isuccess;
  }

  /**
   * Changes the approval status of the FAQ on the server.
   * @param approved The new approval status of the FAQ.
   * @returns An object indicating whether the operation was successful or not.
   */
  async changeApproved(approved: boolean) {
    const observer$ = StockCounterClient.ehttp
      .makePost(`/faq/changeapproved/${this._id}`, {
        approved
      });
    const added = await lastValueFrom(observer$) as Isuccess;
    if (added.success) {
      this.approved = approved;
    }
    return added;
  }

  /**
   * Deletes the FAQ from the server.
   * @returns An object indicating whether the operation was successful or not.
   */
  async deleteFaq() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete(`/faq/deleteone/${this._id}`);
    return await lastValueFrom(observer$) as Isuccess;
  }
}


/** */
export class FaqAnswer
  extends DatabaseAuto {
  /** */
  urId: string;

  /** */
  faq: string;

  /** */
  userId: User | string;

  /** */
  ans: string;

  /** */
  constructor(
    data: Ifaqanswer
  ) {
    super(data);
    this.urId = data.urId;
    this.faq = data.faq;
    if ((data.userId as Iuser)._id) {
      this.userId = new User(data.userId as Iuser);
    } else {
      this.userId = data.userId as string;
    }
    this.ans = data.ans;
  }

  /** */
  static async getFaqAns(
    faq: string
  ) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/faq/getallans/${faq}`);
    const faqans = await lastValueFrom(observer$) as Ifaqanswer[];
    return faqans.map(val => new FaqAnswer(val));
  }

  /** */
  static async getOnefaqAns(
    id: string
  ) {
    const observer$ = StockCounterClient.ehttp.makeGet(`/faq/getone/${id}`);
    const faqans = await lastValueFrom(observer$) as Ifaqanswer;
    return new FaqAnswer(faqans);
  }

  /** */
  static async createfaqAns(
    faq: Ifaqanswer
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePost('/faq/createans', {
        faq
      });
    const added = await lastValueFrom(observer$) as Isuccess;
    return added;
  }

  /** */
  async deleteFaqAns() {
    const observer$ = StockCounterClient.ehttp
      .makeDelete(`/faq/deleteoneans/${this._id}`);
    return await lastValueFrom(observer$) as Isuccess;
  }
}

