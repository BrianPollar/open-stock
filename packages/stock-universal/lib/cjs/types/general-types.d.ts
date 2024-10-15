import { IcompanyId, IinvoiceRelated, IurId } from './inventory-types';
import { Iitem } from './item.interface';
import { TcompanySubPayStatus, TexpoMode, TorderStatus, TpayType, TpaymentMethod, TpriceCurrenncy, TsubscriptionDurVal, TsubscriptionFeature, TuserActionTrackState, TuserDispNameFormat, TuserType } from './union-types';
/**
 * Represents an interface for a database auto-generated entity.
 */
export interface IdatabaseAuto extends ItrackStamp {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Represents an order with payment-related information.
 */
export interface Iorder extends IpaymentRelated {
    price: number;
    deliveryDate: Date;
}
/**
 * Represents an address.
 */
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
/**
 * Represents the billing information.
 */
export interface Ibilling {
    id: string;
    cardNumber: string;
    expiryDate: Date;
    cvv: string;
    postalCode: string;
}
/**
 * Represents a company.
 */
export interface Icompany extends ItrackStamp, IdatabaseAuto {
    urId: string;
    /** The name of the company. */
    name: string;
    /** The display name of the company. */
    displayName: string;
    /** The date of establishment of the company. */
    dateOfEst: Date;
    address: string;
    /** Additional details about the company. */
    details: string;
    /** The format of the company's display name. */
    companyDispNameFormat: string;
    /** The business type of the company. */
    businessType: string;
    /** The password of the company. */
    password: string;
    /** The website address of the company. */
    websiteAddress: string;
    /** The photos associated with the company. */
    photos: string[] | IfileMeta[];
    /** Indicates if the company is blocked. */
    blocked: boolean;
    /** Indicates if the company is verified. */
    verified: boolean;
    /** The expiration date of the company. */
    expireAt: string;
    /** The reasons for blocking the company. */
    blockedReasons: IblockedReasons;
    /** Indicates if the company has left. */
    left?: boolean;
    /** The date when the company left. */
    dateLeft: Date;
    /**
      * The expiration date of the user's account.
      */
    owner: Iuser | string;
}
/**
 * Represents the reasons for blocking a user.
 */
export interface IblockedReasons {
    subscriptionInActive: boolean;
    banned: boolean;
}
/**
 * Represents a user in the system.
 */
export interface Iuser extends IdatabaseAuto, ItrackStamp, Partial<IcurrencyProp> {
    /**
     * The unique identifier of the user.
     */
    _id: string;
    /**
     * The user's UR ID.
     */
    urId: string;
    /**
     * The user's first name.
     */
    fname: string;
    /**
     * The user's last name.
     */
    lname: string;
    /**
     * The user's company name.
     */
    companyName?: string;
    /**
     * The user's company ID.
     */
    companyId?: Icompany | string;
    /**
     * The user's address(es).
     */
    address: Iaddress[];
    /**
     * The user's billing information.
     */
    billing: Ibilling[];
    /**
     * The user's green IPs.
     */
    greenIps?: string[];
    /**
     * The user's red IPs.
     */
    redIps?: string[];
    /**
     * The user's unverified IPs.
     */
    unverifiedIps?: string[];
    /**
     * The user's UID.
     */
    uid?: string;
    /**
     * The user's DID.
     */
    did?: string;
    /**
     * The user's AID.
     */
    aid?: string;
    /**
     * The user's age.
     */
    age?: string;
    /**
     * The user's gender.
     */
    gender?: string;
    /**
     * The user's admin status.
     */
    admin: boolean;
    /**
     * The user's permissions.
     */
    permissions: Iuserperm;
    /**
     * The user's email address.
     */
    email: string;
    /**
     * The user's phone number.
     */
    phone: number;
    /**
     * The expiration date of the user's account.
     */
    expireAt?: string;
    /**
     * Indicates if the user is verified.
     */
    verified?: boolean;
    /**
     * The Authy ID of the user.
     */
    authyId?: string;
    /**
     * The user's password.
     */
    password?: string;
    /**
     * The social framework used by the user.
     */
    socialAuthFrameworks?: {
        providerName: string;
        id: string;
    }[];
    /**
     * The blocked status of the user.
     */
    blocked?: IuserBlocked;
    /**
     * The country code of the user's phone number.
     */
    countryCode?: string;
    /**
     * The amount due for the user.
     */
    amountDue?: number;
    /**
     * Indicates if the user was manually added.
     */
    manuallyAdded: boolean;
    /**
     * Indicates if the user is online.
     */
    online?: boolean;
    /**
     * The salutation for the user.
     */
    salutation?: string;
    /**
     * Additional details about the user's company.
     */
    extraCompanyDetails?: string;
    /**
     * The display name format for the user.
     */
    userDispNameFormat?: TuserDispNameFormat;
    /**
     * The type of user.
     */
    userType?: TuserType;
    /**
     * The user's photos.
     */
    photos?: string[] | IfileMeta[];
    /**
     * The user's profile picture.
     */
    profilePic?: string | IfileMeta;
    /**
     * The user's profile cover picture.
     */
    profileCoverPic?: string | IfileMeta;
}
/**
 * Represents the interface for a user blocked status.
 */
export interface IuserBlocked {
    status: boolean;
    loginAttemptRef: string;
    timesBlocked: number;
}
/**
 * Represents the main review interface.
 */
export interface IreviewMain extends IurId, Partial<IcompanyId> {
    image?: string;
    name: string;
    email: string;
    comment: string;
    rating: number;
    images?: string[];
    userId: Iuser | string;
    itemId: string;
}
/**
 * Represents a cart item.
 */
export interface Icart {
    item: any;
    quantity: number;
    rate: number;
    totalCostwithNoShipping: number;
}
/**
 * Represents the interface for a cart item.
 */
export interface IcartInterface {
    item: Iitem;
    totalCostwithNoShipping: number;
}
/**
 * Represents the total information of a cart.
 */
export interface IcartTotal {
    qntity: number;
    totalCost: number;
    totalShipping: number;
    totalCostNshipping: number;
    currency: string;
}
/**
 * Represents a notification card.
 */
export interface InotificationCard {
    image: string;
    title: string;
    time: number;
}
/**
 * Represents a notification object.
 */
export interface Inotification {
    all: InotificationCard[];
    deals: InotificationCard[];
    orders: InotificationCard[];
    others: InotificationCard[];
}
/**
 * Represents a payment object.
 */
export interface Ipayment extends IpaymentRelated {
    order: Iorder | string;
}
/**
 * Represents a frequently asked question.
 */
export interface Ifaq extends IurId, Partial<IcompanyId>, ItrackStamp {
    /**
     * The name of the person who posted the question.
     */
    posterName: string;
    /**
     * The email of the person who posted the question.
     */
    posterEmail: string;
    /**
     * The ID of the user who posted the question.
     * Can be either a string or an instance of the Iuser interface.
     */
    userId: string | Iuser;
    /**
     * The question itself.
     */
    qn: string;
    /**
     * The date and time when the question was created.
     */
    createdAt: Date;
    /**
     * Indicates whether the question has been approved.
     */
    approved: boolean;
}
/**
 * Represents an FAQ answer.
 */
export interface Ifaqanswer extends IurId, Partial<IcompanyId>, ItrackStamp {
    faq: string;
    userId: string | Iuser;
    ans: string;
}
/**
 * Represents the permissions for a property.
 */
export interface IpermProp {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
}
/**
 * Represents the permissions of a user.
 */
export interface Iuserperm {
    orders?: IpermProp | boolean;
    payments?: IpermProp | boolean;
    users?: IpermProp | boolean;
    items?: IpermProp | boolean;
    faqs?: IpermProp | boolean;
    buyer?: boolean;
    customers?: IpermProp | boolean;
    staffs?: IpermProp | boolean;
    estimates?: IpermProp | boolean;
    invoices?: IpermProp | boolean;
    decoys?: IpermProp | boolean;
    offers?: IpermProp | boolean;
    jobCards?: IpermProp | boolean;
    deliveryNotes?: IpermProp | boolean;
    receipts?: IpermProp | boolean;
    expenses?: IpermProp | boolean;
    reports?: IpermProp | boolean;
    mails?: IpermProp | boolean;
    deliveryCitys?: IpermProp | boolean;
    subscriptions?: IpermProp | boolean;
    companyProfile?: boolean;
    companyAdminAccess: boolean;
    viewTrackStamp?: boolean;
}
/**
 * Represents the interface for a company's permission.
 */
export interface IcompanyPerm {
    active: boolean;
}
export interface IsuperAdimPerms {
    byPassActiveCompany: boolean;
    modifyDeleted: boolean;
    modifyActive: boolean;
}
/**
 * Represents a delivery city.
 */
export interface Ideliverycity extends IdatabaseAuto, ItrackStamp {
    companyId?: string;
    name: string;
    shippingCost: number;
    currency: TpriceCurrenncy;
    deliversInDays: number;
}
/**
 * Represents the credentials for a bargain.
 */
export interface IbagainCredential {
    state: boolean;
    code: string;
    codeMain: IpromoCode;
}
/**
 * Represents a video object.
 */
export interface Ivideo extends IdatabaseAuto, ItrackStamp {
    name: string;
    videoUrl: string;
    formart: string;
    thumbnail: string;
}
/**
 * Represents an interface for Iexpo.
 */
export interface Iexpo {
    mode: TexpoMode;
}
/**
 * Represents the top intro interface.
 */
export interface ItopIntro extends IdatabaseAuto, ItrackStamp {
    bottomDesc: string;
    header: string;
    headerDesc: string;
}
/**
 * Represents a payment-related interface.
 */
export interface IpaymentRelated extends IinvoiceRelated, IurId, Partial<IcompanyId>, ItrackStamp {
    payType?: TpayType;
    companyId?: string;
    paymentRelated?: string;
    orderDate?: Date;
    paymentDate?: Date;
    billingAddress?: Ibilling;
    shippingAddress?: Iaddress;
    currency: string;
    isBurgain?: boolean;
    shipping?: number;
    manuallyAdded?: boolean;
    paymentMethod: TpaymentMethod;
    orderStatus?: TorderStatus;
    orderDeliveryCode?: string;
}
/**
 * Represents the interface for deleting credentials and invoice relationships.
 */
export interface IdeleteCredentialsInvRel {
    id: string;
    creationType: string;
    invoiceRelated: string;
    stage: string;
}
/**
 * Represents a city.
 */
export interface Icity {
    name: string;
    dateAdded?: Date;
}
/**
 * Represents a promotional code.
 */
export interface IpromoCode extends IcurrencyProp {
    urId: string;
    /** The user's company ID. */
    companyId?: string;
    code: string;
    amount: number;
    items: string[];
    roomId: string;
    state: string;
}
/**
 * Represents the metadata of a file.
 */
export interface IfileMeta extends IdatabaseAuto, ItrackStamp {
    userOrCompanayId?: string;
    name?: string;
    url: string;
    type?: string;
    size?: string | number;
    storageDir?: string;
    version?: string;
    photoColor?: string;
}
export interface IsubscriptionFeature {
    type: TsubscriptionFeature;
    name: string;
    limitSize: number;
    remainingSize?: number;
}
export interface IsubscriptionPackage extends IdatabaseAuto, ItrackStamp {
    name: string;
    amount: number;
    duration: TsubscriptionDurVal;
    active?: boolean;
    features: IsubscriptionFeature[];
}
export interface IcompanySubscription extends IdatabaseAuto, ItrackStamp, IcompanyId {
    name: string;
    amount: number;
    duration: TsubscriptionDurVal;
    active: boolean;
    subscriprionId: string;
    features: IsubscriptionFeature[];
    startDate: Date;
    endDate: Date;
    pesaPalorderTrackingId?: string;
    status: TcompanySubPayStatus;
}
export interface IsubscriptionDuration {
    name: string;
    value: TsubscriptionDurVal;
}
export interface ImodelLimit {
    val: number;
    cost: number;
}
export interface IuserWallet extends IdatabaseAuto, IurId {
    user: string | Iuser;
    accountBalance: number;
    currency: string;
}
export interface IwalletHistory extends IdatabaseAuto, IcurrencyProp, IurId {
    wallet: string | IuserWallet;
    amount: number;
    type: 'withdrawal' | 'deposit';
}
export interface IecommerceRevenue extends IdatabaseAuto {
    invoiceRelated: string | IinvoiceRelated;
    amount: number;
    expireAt?: string;
}
export interface IuserActionTrack extends IuserOnlineAddrInfo {
    _id: string | Iuser;
    state?: TuserActionTrackState;
    createdAt: string;
    updatedAt?: string;
}
export interface ItrackView extends IdatabaseAuto {
    parent: string;
    users: IuserActionTrack[];
    collectionName: string;
    expireDocAfter?: Date;
}
export interface ItrackEdit extends IdatabaseAuto {
    parent: string;
    createdBy?: string | Iuser;
    users: IuserActionTrack[];
    deletedBy?: string | Iuser;
    collectionName: string;
}
export interface ItrackStamp {
    trackEdit?: string | ItrackEdit;
    trackView?: string | ItrackView;
    isDeleted?: boolean;
    trackDeleted?: string | ItrackDeleted;
}
export interface IuserOnlineAddrInfo {
    ip?: string;
    deviceInfo?: string;
}
export interface ItrackDeleted {
    parent: string;
    deletedAt?: string;
    expireDocAfter?: Date;
    collectionName: string;
}
export interface IcompanySetting extends ItrackStamp {
    companyId: string;
    trashPeriod: number;
}
export interface IcurrencyProp {
    currency: string;
}
export interface IcomparisonFilter {
    field: string;
    fieldValue: number | Date | string;
    operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte';
}
export interface IpropFilter {
    [key: string]: number | boolean | Date | string | string[];
}
export interface IpropSort {
    [key: string]: 'asc' | 'desc';
}
export interface IfilterProps {
    searchterm?: string;
    searchKey?: string;
    offset?: number;
    limit?: number;
    propFilter?: IpropFilter;
    comparisonFilter?: IcomparisonFilter[];
    propSort?: IpropSort;
    returnEmptyArr?: boolean;
}
export interface IfilterAggResponse<T> {
    data: T[];
    total: {
        count: number;
    };
}
