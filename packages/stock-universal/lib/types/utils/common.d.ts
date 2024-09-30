import { ImodelLimit, IsubscriptionFeature, IsubscriptionPackage } from '../interfaces/general.interface';
/**
 * Array of inventory statuses.
 */
export declare const invStatus: string[];
/**
 * Represents the possible order statuses.
 */
export declare const orderStatus: {
    name: string;
    value: string;
}[];
/**
 * Payment methods available for selection.
 */
export declare const paymentMethod: {
    name: string;
    value: string;
}[];
/**
 * Represents the tax types.
 */
export declare const taxTypes: {
    name: string;
    val: string;
}[];
/**
 * Represents an array of currency objects.
 */
export declare const currency: {
    name: string;
    value: string;
}[];
/**
 * Represents the list of product types.
 */
export declare const productType: {
    name: string;
    value: string;
}[];
/**
 * Represents the state of a product.
 */
export declare const productState: ({
    name: string;
    refurbished: string;
    value?: undefined;
} | {
    name: string;
    value: string;
    refurbished?: undefined;
})[];
export declare const subscriptionPackages: IsubscriptionPackage[];
export declare const moduleSubVolume: IsubscriptionFeature[];
export declare const modelLimitSelect: ImodelLimit[];
