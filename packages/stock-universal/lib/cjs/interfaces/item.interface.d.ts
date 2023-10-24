import { TpriceCurrenncy, TitemColor, TitemState } from '../types/union.types';
import { IurId } from './inventory.interface';
/** */
export interface Iitem extends IurId {
    numbersInstock: number;
    name: string;
    brand: string;
    type: string;
    category: string;
    state: TitemState;
    photos: string[];
    colors: TitemColor[];
    model: string;
    origin: string;
    anyKnownProblems: string;
    createdAt: Date;
    updatedAt: Date;
    costMeta: IcostMeta;
    description: string;
    numberBought: number;
    sponsored: Isponsored[];
    buyerGuarantee: string;
    reviewedBy: string[];
    reviewCount: number;
    reviewWeight: number;
    reviewRatingsTotal: number;
    likes: string[];
    likesCount: number;
    timesViewed: number;
    orderedQty?: number;
    inventoryMeta: IinventoryMeta[];
}
/** */
export interface IcostMeta {
    sellingPrice: number;
    costPrice: number;
    currency: TpriceCurrenncy;
    discount: number;
    offer: boolean;
}
/** */
export interface Isizing {
    small: number;
    okay: number;
    large: number;
}
/** */
export interface Isponsored {
    item: string | Iitem;
    discount: number;
}
/** */
export interface IinventoryMeta {
    date: Date;
    quantity: number;
    cost: number;
}
