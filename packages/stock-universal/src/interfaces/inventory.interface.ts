/**
 * @fileoverview This file contains interfaces related to inventory management, such as invoices, expenses, quotations, job cards, receipts, reports, and invoice settings.
 * @packageDocumentation
 */

import {
  TestimateStage,
  TexpenseCategory,
  TinvoiceStatus,
  TinvoiceType,
  TpayType,
  TreceiptType
} from '../types/union.types';
import { IdatabaseAuto } from './general.interface';
import { Iitem } from './item.interface';

/**
 * Represents an invoice.
 */
export interface Iinvoice extends IinvoiceRelated {
  estimateId: number;
  dueDate: Date;
}

/**
 * Represents an expense in the inventory.
 */
export interface Iexpense extends IurId {
  name: string;
  person: string;
  cost: number;
  category: TexpenseCategory;
  note: string;
  items?: Iitem[];
}

/**
 * Represents the profit information for an item.
 */
export interface Iprofit {
  margin: number;
  origCost: number;
  soldAtPrice: number;
}

/**
 * Represents a quotation in the inventory.
 */
export interface Iquotation extends IdatabaseAuto {
  fnames: string;
  date: Date;
  itemQty: number;
  rate: number;
  amount: number;
  items: Iitem[] | string[];
  subTotal: number;
  tax: number;
  total: number;
}

/** Represents an invoice-related object. */
export interface IinvoiceRelated extends IdatabaseAuto {
  payType?: TpayType;
  companyId?: string;
  invoiceRelated?: string;
  creationType?: TinvoiceType;
  estimateId?: number;
  invoiceId?: number;
  billingUser?: string;
  billingUserId?: string;
  billingUserPhoto?: string;
  extraCompanyDetails?: string;
  items?: IinvoiceRelatedPdct[];
  fromDate?: Date;
  toDate?: Date;
  status?: TinvoiceStatus;
  stage?: TestimateStage;
  cost?: number;
  paymentMade?: number;
  tax?: number;
  balanceDue?: number;
  subTotal?: number;
  total?: number;
  payments?: string[] | Ireceipt[];
}

/** Represents an invoice-related product. */
export interface IinvoiceRelatedPdct {
  item: string;
  itemName?: string;
  itemPhoto?: string;
  quantity: number;
  rate: number;
  amount: number;
}

/** Represents a client in a job card. */
export interface IjobCardClient {
  userId?: string; // linkable to buyer
  name: string;
  phone: string;
  email: string;
}

/** Represents a machine in a job card. */
export interface IjobCardMachine {
  name: string;
  model: string;
  serialNo: string;
}

/** Represents a problem in a job card. */
export interface IjobCardProblem {
  reportedIssue: string;
  details: string;
  issueOnFirstLook: string;
}

/** Represents a job card. */
export interface IjobCard extends IurId {
  client: IjobCardClient;
  machine: IjobCardMachine;
  problem: IjobCardProblem;
  cost: number;
}

/** Represents an estimate. */
export interface Iestimate extends IinvoiceRelated {
  estimateId: number;
}

/** Represents a receipt. */
export interface Ireceipt extends IurId, IinvoiceRelated {
  estimateId: number;
  ammountRcievd: number;
  paymentMode: string;
  type: TreceiptType;
  date: Date;
  amount: number;
}

/** Represents a pickup location. */
export interface IpickupLocation extends IdatabaseAuto {
  companyId?: string;
  name: string;
  contact: IpickupLocationContact;
}

/** Represents a contact in a pickup location. */
export interface IpickupLocationContact {
  name: string;
  phone: string;
  email: string;
}

/** Represents an ID. */
export interface IurId extends IdatabaseAuto {
  urId?: string;
  companyId?: string;
}

/** Represents an expense invoice ID. */
export interface IexpenseInvoiceId {
  invoiceId: number;
  estimateId: number;
}

/** Represents an invoice-related reference. */
export interface IinvoiceRelatedRef {
  payType?: TpayType;
  companyId?: string;
  invoiceRelated: string | IinvoiceRelated;
}

/** Represents a report-related object. */
export interface IreportRelated extends IurId {
  date: Date;
  totalAmount: number;
}

/** Represents an expense report. */
export interface IexpenseReport extends IreportRelated {
  expenses: string[] | Iexpense[];
}

/** Represents a sales report. */
export interface IsalesReport extends IreportRelated {
  estimates: string[] | Iestimate[];
  invoiceRelateds: string[] | IinvoiceRelated[];
}

/** Represents an invoices report. */
export interface IinvoicesReport extends IreportRelated {
  invoices: string[] | Iinvoice[];
}

/** Represents a profit and loss report. */
export interface IprofitAndLossReport extends IreportRelated {
  expenses: string[] | Iexpense[];
  invoiceRelateds: string[] | IinvoiceRelated[];
}

/** Represents a tax report. */
export interface ItaxReport extends IreportRelated {
  estimates: string[] | Iestimate[];
  invoiceRelateds: string[] | IinvoiceRelated[];
}

/** Represents invoice settings. */
export interface IinvoiceSetting extends IdatabaseAuto {
  generalSettings: IinvoiceSettingsGeneral;
  taxSettings: IinvoiceSettingsTax;
  bankSettings: IinvoiceSettingsBank;
}

/** Represents general settings in invoice settings. */
export interface IinvoiceSettingsGeneral {
  status: TinvoiceStatus;
  amount: string;
  defaultDueTime: string;
  defaultDigitalSignature: string;
  defaultDigitalStamp: string;
  defaultDigitalName: string;
}

/** Represents tax settings in invoice settings. */
export interface IinvoiceSettingsTax {
  enabled: boolean;
  defaultType: string;
  vatPercentage: number;
  incomePercentage: number;
  itemsBulkPercentage: number;
  gstinNo: string;
  taxes: ItaxVal[];
}

/** Represents a tax value. */
export interface ItaxVal {
  id: string;
  name: string;
  percentage: number;
  status: 'active' | 'inactive';
}

/** Represents bank settings in invoice settings. */
export interface IinvoiceSettingsBank {
  enabled: boolean;
  holderName: string;
  bankName: string;
  ifscCode: string;
  accountNumber: string;
}
