import { IdataArrayResponse, IdeleteCredentialsInvRel, IinvoiceRelated, IsubscriptionFeatureState, Isuccess } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
import { InvoiceRelatedWithReceipt } from './invoice.define';

/** DeliveryNote  class: This class extends the  InvoiceRelated  class (which is not provided) and represents a delivery note. It has a  urId  property to store the unique identifier of the delivery note. */
/**
 * Represents a delivery note, which is an invoice-related data structure.
 * Extends the `InvoiceRelatedWithReceipt` class.
 */
export class DeliveryNote extends InvoiceRelatedWithReceipt {
  /** The unique identifier of the delivery note. */
  urId: string;

  /** The user's company ID. */
  companyId: string;

  /**
   * Creates a new `DeliveryNote` instance.
   * @param data An object containing the data to initialize the `DeliveryNote` instance with.
   */
  constructor(data) {
    super(data);
    this.urId = data.urId;
    this.companyId = data.companyId;
  }

  /**
   * Retrieves a list of delivery notes from a specified URL, with optional pagination parameters for offset and limit.
   * Uses the `StockCounterClient.ehttp` object to make an HTTP GET request and returns an array of `DeliveryNote` instances.
   * @param companyId - The ID of the company
   * @param url The URL to retrieve the delivery notes from. Defaults to `'getall'`.
   * @param offset The offset to use for pagination. Defaults to `0`.
   * @param limit The limit to use for pagination. Defaults to `0`.
   * @returns An array of `DeliveryNote` instances.
   */
  static async getDeliveryNotes(
    companyId: string,
    url = 'getall',
    offset = 0,
    limit = 20
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/deliverynote/${url}/${offset}/${limit}/${companyId}`);
    const deliverynotes = await lastValueFrom(observer$) as IdataArrayResponse;

    return {
      count: deliverynotes.count,
      deliverynotes: deliverynotes.data
        .map((val) => new DeliveryNote(val as IinvoiceRelated))
    };
  }

  /**
   * Retrieves a single delivery note by its unique identifier (`urId`).
   * Uses the `StockCounterClient.ehttp` object to make an HTTP GET request and returns a single `DeliveryNote` instance.
   * @param companyId - The ID of the company
   * @param urId The unique identifier of the delivery note to retrieve.
   * @returns A single `DeliveryNote` instance.
   */
  static async getOneDeliveryNote(
    companyId: string,
    urId: string
  ) {
    const observer$ = StockCounterClient.ehttp
      .makeGet(`/deliverynote/getone/${urId}/${companyId}`);
    const deliverynote = await lastValueFrom(observer$) as IinvoiceRelated;

    return new DeliveryNote(deliverynote);
  }

  /**
   * Adds a new delivery note to the system.
   * Takes an `invoiceRelated` object as a parameter, which is an invoice-related data structure.
   * Uses the `StockCounterClient.ehttp` object to make an HTTP POST request with the delivery note and invoice-related data, and returns a success response.
   * @param companyId - The ID of the company
   * @param invoiceRelated An `invoiceRelated` object containing the data for the delivery note.
   * @returns A success response.
   */
  static async addDeliveryNote(
    companyId: string,
    invoiceRelated: IinvoiceRelated
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePost(`/deliverynote/create/${companyId}`, { deliveryNote: {}, invoiceRelated });

    return await lastValueFrom(observer$) as IsubscriptionFeatureState;
  }

  /**
   * Deletes multiple delivery notes based on the provided credentials.
   * Takes an array of `credentials` objects, where each object contains the necessary information to identify and delete a delivery note.
   * Uses the `StockCounterClient.ehttp` object to make an HTTP PUT request with the credentials data, and returns a success response.
   * @param companyId - The ID of the company
   * @param credentials An array of `credentials` objects containing the data to identify and delete the delivery notes.
   * @returns A success response.
   */
  static async deleteDeliveryNotes(
    companyId: string,
    credentials: IdeleteCredentialsInvRel[]
  ) {
    const observer$ = StockCounterClient.ehttp
      .makePut(`/deliverynote/deletemany/${companyId}`, { credentials });

    return await lastValueFrom(observer$) as Isuccess;
  }
}
