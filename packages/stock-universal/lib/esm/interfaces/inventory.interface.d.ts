import { TestimateStage, TexpenseCategory, TinvoiceStatus, TinvoiceType, TreceiptType } from '../types/union.types';
import { IdatabaseAuto } from './general.interface';
import { Iitem } from './item.interface';
/** */
export interface Iinvoice extends IinvoiceRelated {
    estimateId: number;
    dueDate: Date;
}
/** */
export interface Iexpense extends IurId {
    name: string;
    person: string;
    cost: number;
    category: TexpenseCategory;
    note: string;
    items?: Iitem[];
}
/** */
export interface Iprofit {
    margin: number;
    origCost: number;
    soldAtPrice: number;
}
/** */
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
/** */
export interface IinvoiceRelated extends IdatabaseAuto {
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
/** */
export interface IinvoiceRelatedPdct {
    item: string;
    itemName?: string;
    itemPhoto?: string;
    quantity: number;
    rate: number;
    amount: number;
}
/** */
export interface IjobCardClient {
    userId?: string;
    name: string;
    phone: string;
    email: string;
}
/** */
export interface IjobCardMachine {
    name: string;
    model: string;
    serialNo: string;
}
/** */
export interface IjobCardProblem {
    reportedIssue: string;
    details: string;
    issueOnFirstLook: string;
}
/** */
export interface IjobCard extends IurId {
    client: IjobCardClient;
    machine: IjobCardMachine;
    problem: IjobCardProblem;
    cost: number;
}
/** */
export interface Iestimate extends IinvoiceRelated {
    estimateId: number;
}
/** */
export interface Ireceipt extends IurId, IinvoiceRelated {
    estimateId: number;
    ammountRcievd: number;
    paymentMode: string;
    type: TreceiptType;
    date: Date;
    amount: number;
}
/** */
export interface IpickupLocation extends IdatabaseAuto {
    name: string;
    contact: IpickupLocationContact;
}
/** */
export interface IpickupLocationContact {
    name: string;
    phone: string;
    email: string;
}
/** */
export interface IurId extends IdatabaseAuto {
    urId?: string;
}
/** */
export interface IexpenseInvoiceId {
    invoiceId: number;
    estimateId: number;
}
/** */
export interface IinvoiceRelatedRef {
    invoiceRelated: string | IinvoiceRelated;
}
/** */
export interface IreportRelated extends IurId {
    date: Date;
    totalAmount: number;
}
/** */
export interface IexpenseReport extends IreportRelated {
    expenses: string[] | Iexpense[];
}
/** */
export interface IsalesReport extends IreportRelated {
    estimates: string[] | Iestimate[];
    invoiceRelateds: string[] | IinvoiceRelated[];
}
/** */
export interface IinvoicesReport extends IreportRelated {
    invoices: string[] | Iinvoice[];
}
/** */
export interface IprofitAndLossReport extends IreportRelated {
    expenses: string[] | Iexpense[];
    invoiceRelateds: string[] | IinvoiceRelated[];
}
/** */
export interface ItaxReport extends IreportRelated {
    estimates: string[] | Iestimate[];
    invoiceRelateds: string[] | IinvoiceRelated[];
}
/** */
export interface IinvoiceSetting extends IdatabaseAuto {
    generalSettings: IinvoiceSettingsGeneral;
    taxSettings: IinvoiceSettingsTax;
    bankSettings: IinvoiceSettingsBank;
}
/** */
export interface IinvoiceSettingsGeneral {
    status: TinvoiceStatus;
    amount: string;
    defaultDueTime: string;
    defaultDigitalSignature: string;
    defaultDigitalStamp: string;
    defaultDigitalName: string;
}
/** */
export interface IinvoiceSettingsTax {
    enabled: boolean;
    defaultType: string;
    vatPercentage: number;
    incomePercentage: number;
    itemsBulkPercentage: number;
    gstinNo: string;
    taxes: ItaxVal[];
}
/** */
export interface ItaxVal {
    id: string;
    name: string;
    percentage: number;
    status: 'active' | 'inactive';
}
/** */
export interface IinvoiceSettingsBank {
    enabled: boolean;
    holderName: string;
    bankName: string;
    ifscCode: string;
    accountNumber: string;
}
/** */
