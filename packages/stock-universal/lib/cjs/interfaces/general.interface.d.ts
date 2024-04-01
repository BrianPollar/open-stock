import { DatabaseAuto } from '../defines/base.define';
import { TexpoMode, TpayType, TpaymentMethod, TpriceCurrenncy, TuserDispNameFormat } from '../types/union.types';
import { IinvoiceRelated, IurId } from './inventory.interface';
import { Iitem } from './item.interface';
/**
 * Represents an interface for a database auto-generated entity.
 */
export interface IdatabaseAuto {
    _id?: string;
    createdAt?: Date;
    updatedAt?: Date;
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
export interface Icompany extends IurId {
    /** The name of the company. */
    name: string;
    /** The display name of the company. */
    displayName: string;
    /** The date of establishment of the company. */
    dateOfEst: string;
    /** Additional details about the company. */
    details: string;
    /** The format of the company's display name. */
    companyDispNameFormat: string;
    /** The business type of the company. */
    businessType: string;
    /** The profile picture of the company. */
    profilePic: string | IfileMeta;
    /** The profile cover picture of the company. */
    profileCoverPic: string | IfileMeta;
    /** The password of the company. */
    password: string;
    /** The website address of the company. */
    websiteAddress: string;
    /** The callback URL for Pesapal. */
    pesapalCallbackUrl: string;
    /** The cancellation URL for Pesapal. */
    pesapalCancellationUrl: string;
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
export interface Iuser extends IdatabaseAuto {
    /**
     * The unique identifier of the user.
     */
    _id: string;
    /**
     * The user's UR ID.
     */
    urId?: string;
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
    admin: string;
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
     * Indicates if the user is from a social framework.
     */
    fromsocial?: boolean;
    /**
     * The social framework used by the user.
     */
    socialframework?: string;
    /**
     * The social ID of the user.
     */
    socialId?: string;
    /**
     * The blocked status of the user.
     */
    blocked?: IuserBlocked;
    /**
     * The country code of the user's phone number.
     */
    countryCode?: number;
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
    userType?: string;
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
export interface IreviewMain extends IurId {
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
export interface Ifaq extends IurId {
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
    createdAt?: Date;
    /**
     * Indicates whether the question has been approved.
     */
    approved: boolean;
}
/**
 * Represents an FAQ answer.
 */
export interface Ifaqanswer extends IurId {
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
    orders: IpermProp;
    payments: IpermProp;
    users: IpermProp;
    items: IpermProp;
    faqs: IpermProp;
    videos: IpermProp;
    printables: IpermProp;
    buyer: IpermProp;
}
/**
 * Represents the interface for a company's permission.
 */
export interface IcompanyPerm {
    active: boolean;
}
/**
 * Represents a delivery city.
 */
export interface Ideliverycity extends IdatabaseAuto {
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
export interface Ivideo extends IdatabaseAuto {
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
export interface ItopIntro extends IdatabaseAuto {
    bottomDesc: string;
    header: string;
    headerDesc: string;
}
/**
 * Represents a payment-related interface.
 */
export interface IpaymentRelated extends IinvoiceRelated, IurId {
    payType?: TpayType;
    companyId?: string;
    paymentRelated?: string;
    orderDate?: Date;
    paymentDate?: Date;
    billingAddress?: Ibilling;
    shippingAddress?: Iaddress;
    currency?: string;
    isBurgain?: boolean;
    shipping?: number;
    manuallyAdded?: boolean;
    paymentMethod: TpaymentMethod;
}
/**
 * Represents the interface for deleting credentials related to payment.
 */
export interface IdeleteCredentialsPayRel {
    id: string;
    paymentRelated: string;
    creationType: string;
    where: string;
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
export interface IpromoCode {
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
 * Represents the interface for deleting credentials of a local user.
 */
export interface IdeleteCredentialsLocalUser {
    userId: string;
    id?: string;
}
/**
 * Represents the metadata of a file.
 */
export interface IfileMeta extends IdatabaseAuto {
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
    name: string;
    limitSize: number;
    remainingSize?: number;
}
export interface IsubscriptionPackage extends DatabaseAuto {
    name: string;
    ammount: number;
    duration: number;
    active: boolean;
    features: IsubscriptionFeature[];
}
export interface IcompanySubscription extends DatabaseAuto {
    companyId: string;
    active: boolean;
    sunscriprionId: string;
    features: IsubscriptionFeature[];
    startDate: Date;
    endDate: Date;
}
