/**
 * @fileoverview This file contains interfaces related to inventory management,
 * such as invoices, expenses, quotations, job cards, receipts, reports, and invoice settings.
 * @packageDocumentation
 */
import { IcurrencyProp, IdatabaseAuto, IfileMeta, ItrackStamp } from './general-types';
import { Iitem } from './item.interface';
import { TestimateStage, TexpenseCategory, TinvoiceStatus, TinvoiceType, TpayType, TreceiptType } from './union-types';
/**
 * Represents an invoice.
 */
export interface Iinvoice extends IinvoiceRelated, IurId, Partial<IcompanyId> {
    estimateId: number;
    dueDate: Date;
}
/**
 * Represents an expense in the inventory.
 */
export interface Iexpense extends IurId, Partial<IcompanyId>, ItrackStamp, IcurrencyProp {
    name: string;
    person: string;
    cost: number;
    category: TexpenseCategory;
    note: string;
    items?: Iitem[] | string[];
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
export interface Iquotation extends IdatabaseAuto, ItrackStamp, IcurrencyProp {
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
export interface IinvoiceRelated extends IdatabaseAuto, ItrackStamp, IcurrencyProp, Partial<IcompanyId> {
    payType?: TpayType;
    invoiceRelated?: string;
    creationType: TinvoiceType;
    estimateId?: number;
    invoiceId?: number;
    billingUser: string;
    billingUserId: string;
    billingUserPhoto?: string;
    extraCompanyDetails?: string;
    items: IinvoiceRelatedPdct[];
    fromDate: Date;
    toDate: Date;
    status: TinvoiceStatus;
    stage: TestimateStage;
    cost: number;
    paymentMade: number;
    tax?: number;
    balanceDue: number;
    subTotal: number;
    total: number;
    payments?: string[] | Ireceipt[];
    ecommerceSale?: boolean;
    ecommerceSalePercentage?: number;
}
/** Represents an invoice-related product. */
export interface IinvoiceRelatedPdct extends IcurrencyProp {
    item: string;
    itemName?: string;
    itemPhoto?: string;
    quantity: number;
    rate: number;
    amount: number;
}
/** Represents a client in a job card. */
export interface IjobCardClient {
    userId?: string;
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
export interface IjobCard extends IurId, IcompanyId, ItrackStamp {
    client: IjobCardClient;
    machine: IjobCardMachine;
    problem: IjobCardProblem;
    cost: number;
}
/** Represents an estimate. */
export interface Iestimate extends IinvoiceRelated, IurId, Partial<IcompanyId> {
    estimateId: number;
}
/** Represents a receipt. */
export interface Ireceipt extends IurId, Partial<IcompanyId>, IinvoiceRelated {
    estimateId?: number;
    amountRcievd: number;
    paymentMode: string;
    type: TreceiptType;
    date: Date;
    amount: number;
}
/** Represents a pickup location. */
export interface IpickupLocation extends IdatabaseAuto, ItrackStamp {
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
    urId: string;
}
export interface IcompanyId {
    companyId: string;
}
/** Represents an expense invoice ID. */
export interface IexpenseInvoiceId {
    invoiceId: number;
    estimateId: number;
}
/** Represents an invoice-related reference. */
export interface IinvoiceRelatedRef extends ItrackStamp, IdatabaseAuto {
    urId: string;
    payType?: TpayType;
    companyId?: string;
    invoiceRelated: string | IinvoiceRelated;
}
/** Represents a report-related object. */
export interface IreportRelated extends IurId, IcompanyId, ItrackStamp, IcurrencyProp {
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
export interface IinvoiceSetting extends IdatabaseAuto, ItrackStamp {
    companyId?: string;
    generalSettings: IinvoiceSettingsGeneral;
    taxSettings: IinvoiceSettingsTax;
    bankSettings: IinvoiceSettingsBank;
    printDetails: IinvoicePrintDetails;
}
/** Represents general settings in invoice settings. */
export interface IinvoiceSettingsGeneral {
    status?: TinvoiceStatus;
    currency: string;
    amount: string;
    defaultDueTime: string;
    defaultDigitalSignature?: IfileMeta | string;
    defaultDigitalStamp?: IfileMeta | string;
}
export interface IinvoicePrintDetails {
    email: string;
    phone: string;
    upperHeading1?: string;
    upperHeading2?: string;
    upperDesc: string;
    bottomHaeding1?: string;
    bottomHaeding2?: string;
    bottomDesc1: string;
    bottomDesc2: string;
}
/** Represents tax settings in invoice settings. */
export interface IinvoiceSettingsTax {
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
