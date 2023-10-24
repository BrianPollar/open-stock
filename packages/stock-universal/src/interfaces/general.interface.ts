/**
 * Contains interfaces used throughout the application.
 *
 * @file defines interfaces used throughout the application
 * @since 1.0.0
 */
import {
  TexpoMode,
  // TorderStatus,
  TpaymentMethod,
  // TpaymentRelatedType,
  TpriceCurrenncy,
  TuserDispNameFormat
} from '../types/union.types';
import {
  IinvoiceRelated,
  // IpaymentInstall,
  IurId
} from './inventory.interface';
import { Iitem } from './item.interface';

/** */
export interface IdatabaseAuto {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/** */
export interface Iorder
  extends IpaymentRelated {
  price: number;
  deliveryDate: Date;
}

/** */
export interface Iaddress {
  id: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  country: string;
  state: string;
  city: string;
  zipcode: number;
  phoneNumber: string;
  email: string;
}

/** */
export interface Ibilling {
  id: string;
  cardNumber: string;
  expiryDate: Date;
  cvv: string;
  postalCode: string;
}


/** */
export interface Iuser
  extends IurId {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  fname: string;
  lname: string;
  companyName?: string;
  address: Iaddress[];
  billing: Ibilling[];
  greenIps: string[];
  redIps: string[];
  unverifiedIps: string[];
  uid: string;
  did: string;
  aid: string;
  photo: string;
  age: string;
  gender: string;
  admin: string;
  permissions: Iuserperm;
  email: string;
  phone: number;
  expireAt: string;
  verified: boolean;
  authyId: string;
  password: string;
  fromsocial: boolean;
  socialframework: string;
  socialId: string;
  blocked: IuserBlocked;
  countryCode: number;
  amountDue?: number;
  manuallyAdded: boolean;
  online?: boolean;
  salutation?: string;
  extraCompanyDetails?: string;
  userDispNameFormat?: TuserDispNameFormat;
}

/** */
export interface IuserBlocked {
  status: boolean;
  loginAttemptRef: string;
  timesBlocked: number;
}

/** */
export interface IreviewMain
  extends IurId {
  image?: string;
  name: string;
  email: string;
  comment: string;
  rating: number;
  images?: string[];
  userId: Iuser | string;
  itemId: string;
}

/** */
export interface Icart {
  item;// : TcombinedProductClass;
  quantity: number;
  rate: number;
  totalCostwithNoShipping: number;
}

/** */
export interface IcartInterface {
  item: Iitem;
  totalCostwithNoShipping: number;
}

/** */
export interface IcartTotal {
  qntity: number;
  totalCost: number;
  totalShipping: number;
  totalCostNshipping: number;
}

/** */
export interface InotificationCard {
  image: string;
  title: string;
  time: number;
}

/** */
export interface Inotification {
  all: InotificationCard[];
  deals: InotificationCard[];
  orders: InotificationCard[];
  others: InotificationCard[];
}

/** */
export interface Ipayment
  extends IpaymentRelated {
  // items: TcombinedProductIntrface[] | string[];
  order: Iorder | string;
}

/** */
export interface Ifaq
  extends IurId {
  posterName: string;
  posterEmail: string;
  userId: string | Iuser;
  qn: string;
  createdAt: Date;
  approved: boolean;
}

/** */
export interface Ifaqanswer
  extends IurId {
  faq: string;
  userId: string | Iuser;
  ans: string;
}

/** */
export interface Iuserperm {
  orders: boolean;
  payments: boolean;
  users: boolean;
  items: boolean;
  faqs: boolean;
  videos: boolean;
  printables: boolean;
  buyer: boolean;
}

/** */
export interface Ideliverycity
  extends IdatabaseAuto {
  name: string;
  shippingCost: number;
  currency: TpriceCurrenncy;
  deliversInDays: number;
}

/** */
export interface IbagainCredential {
  state: boolean;
  code: string;
  codeMain: IpromoCode;
}

/** */
export interface Ivideo
  extends IdatabaseAuto {
  name: string;
  videoUrl: string;
  formart: string;
  thumbnail: string;
}

/** */
export interface Iexpo {
  mode: TexpoMode;
}

/** */
export interface ItopIntro
  extends IdatabaseAuto {
  bottomDesc: string;
  header: string;
  headerDesc: string;
}

/** */
export interface IpaymentRelated
extends IinvoiceRelated, IurId {
  paymentRelated?: string;
  // creationType?: TpaymentRelatedType;
  // items?: string[] | TcombinedProductIntrface[];
  orderDate?: Date;
  paymentDate?: Date;
  // amount?: number;
  billingAddress?: Ibilling;
  shippingAddress?: Iaddress;
  // tax?: number;
  currency?: string;
  // user?: string | Iuser;
  isBurgain?: boolean;
  shipping?: number;
  manuallyAdded?: boolean;
  paymentMethod: TpaymentMethod; // momo, airtelmoney or braintree
  // status: TorderStatus;
  // payments: string[] | IpaymentInstall[];
}

/** */
export interface IdeleteCredentialsPayRel {
  id: string;
  paymentRelated: string;
  creationType: string;
  where: string;
}

/** */
export interface IdeleteCredentialsInvRel {
  id: string;
  creationType: string;
  invoiceRelated: string;
  stage: string;
}

/** */
export interface Icity {
  name: string;
  dateAdded?: Date;
}

/** */
export interface IpromoCode {
  urId: string;
  code: string;
  amount: number;
  items: string[];
  roomId: string;
  state: string;
}


export interface IdeleteCredentialsLocalUser {
  userId: string;
  id?: string;
}
