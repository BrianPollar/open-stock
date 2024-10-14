import { IcurrencyProp, IfileMeta } from './general-types';
import { IcompanyId, IurId } from './inventory-types';
import { TitemColor, TitemState } from './union-types';
export interface Iitem extends IurId, IcompanyId {
    numbersInstock: number;
    name: string;
    brand?: string;
    category?: string;
    subCategory?: string;
    state?: TitemState;
    photos?: IfileMeta[] | string[];
    video?: IfileMeta | string;
    colors?: TitemColor[];
    model?: string;
    origin?: string;
    anyKnownProblems?: string;
    createdAt: Date;
    updatedAt: Date;
    costMeta: IcostMeta;
    description?: string;
    numberBought: number;
    sponsored?: Isponsored[];
    buyerGuarantee?: string;
    reviewedBy?: string[];
    reviewCount?: number;
    reviewWeight?: number;
    reviewRatingsTotal?: number;
    likes?: string[];
    likesCount?: number;
    timesViewed?: number;
    orderedQty?: number;
    inventoryMeta: IinventoryMeta[];
    ecomerceCompat: boolean;
    soldCount: number;
}
export interface IcostMeta extends IcurrencyProp {
    sellingPrice: number;
    costPrice: number;
    discount: number;
    offer: boolean;
}
export interface Isizing {
    small: number;
    okay: number;
    large: number;
}
export interface Isponsored {
    item: string | Iitem;
    discount: number;
}
export interface IinventoryMeta extends IcurrencyProp {
    date: Date;
    quantity: number;
    cost: number;
}
export interface IitemDecoy {
    urId: string;
    companyId: string;
    items: Iitem[];
}
export interface IitemOffer {
    urId: string;
    companyId: string;
    items: Iitem[];
}
