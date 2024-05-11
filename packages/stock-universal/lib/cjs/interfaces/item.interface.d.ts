import { TitemColor, TitemState, TpriceCurrenncy } from '../types/union.types';
import { IfileMeta } from './general.interface';
import { IurId } from './inventory.interface';
export interface Iitem extends IurId {
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
}
export interface IcostMeta {
    sellingPrice: number;
    costPrice: number;
    currency: TpriceCurrenncy;
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
export interface IinventoryMeta {
    date: Date;
    quantity: number;
    cost: number;
}
