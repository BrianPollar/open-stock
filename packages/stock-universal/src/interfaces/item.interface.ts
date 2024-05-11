import {
  TitemColor, TitemState,
  TpriceCurrenncy
} from '../types/union.types';
import { IfileMeta } from './general.interface';
import { IurId } from './inventory.interface';

// This file imports the `TcombinedProductClass`, `TpriceCurrenncy`, `TitemColor`, and `TitemState` types from the `union.types` file.
// This file imports the `IurId` interface from the `inventory.interface` file.


export interface Iitem
  extends IurId {
  // The `numbersInstock` property is the number of items in stock.
  numbersInstock: number;
  // The `name` property is the name of the item.
  name: string;
  // The `brand` property is the brand of the item.
  brand?: string;
  // The `category` property is the category of the item.
  category?: string;
  subCategory?: string;
  // The `state` property is the state of the item (new or refurbished).
  state?: TitemState; // new or refurbished
  // The `photos` property is an array of photos of the item.
  photos?: IfileMeta[] | string[];
  video?: IfileMeta | string;
  // The `colors` property is an array of colors that the item is available in.
  colors?: TitemColor[];
  // The `model` property is the model number of the item.
  model?: string;
  // The `origin` property is the country where the item was made.
  origin?: string; // !! this is definitely the country
  // The `anyKnownProblems` property is a string that contains any known problems with the item.
  anyKnownProblems?: string;
  // The `createdAt` property is the date and time the item was created.
  createdAt: Date;
  // The `updatedAt` property is the date and time the item was updated.
  updatedAt: Date;
  // The `costMeta` property contains the cost information for the item.
  costMeta: IcostMeta;
  // The `description` property is a string that contains a description of the item.
  description?: string;
  // The `numberBought` property is the number of times the item has been bought.
  numberBought: number;
  // The `sponsored` property is an array of objects that contain information about sponsored items.
  sponsored?: Isponsored[];
  // The `rating` property contains the rating information for the item.
  // rating: Irating;
  // The `buyerGuarantee` property is a string that contains the buyer guarantee for the item.
  buyerGuarantee?: string;
  // The `reviewedBy` property is an array of strings that contain the names of people who have reviewed the item.
  reviewedBy?: string[];
  // The `reviewCount` property is the number of times the item has been reviewed.
  reviewCount?: number;
  // The `reviewWeight` property is a number that represents the weight of the reviews.
  reviewWeight?: number;
  // The `reviewRatingsTotal` property is the total number of ratings for the item.
  reviewRatingsTotal?: number;
  // The `likes` property is an array of strings that contain the names of people who have liked the item.
  likes?: string[];
  // The `likesCount` property is the number of times the item has been liked.
  likesCount?: number;
  // The `timesViewed` property is the number of times the item has been viewed.
  timesViewed?: number;
  // The `orderedQty` property is the number of items that have been ordered.
  orderedQty?: number; // dis is always not initialised
  // The `inventoryMeta` property contains the inventory information for the item.
  inventoryMeta: IinventoryMeta[];
  ecomerceCompat: boolean;
}

/*
export interface Irating {
  people: string[];
  count: number;
  storeRatingPeople: string[];
  storeRatingRount: number;
  rating: number;
  storeRating: number;
}*/

/*
export interface Ireview {
  people: string[];
  count: number;
  storeReviews: string[];
}*/

/*
export interface Ioffer {
  ammount: number;
  expiry: Date;
}*/


export interface IcostMeta {
  // The `sellingPrice` property is the price that the item is sold for.
  sellingPrice: number;
  // The `costPrice` property is the price that the item was purchased for.
  costPrice: number;
  // The `currency` property is the currency that the prices are in.
  currency: TpriceCurrenncy;
  // The `discount` property is the amount of the discount, if any.
  discount: number;
  // The `offer` property indicates whether the item is currently on offer.
  offer: boolean;
}

// This interface defines the cost information for an item.


export interface Isizing {
  // The `small` property is the number of small items in stock.
  small: number;
  // The `okay` property is the number of okay items in stock.
  okay: number;
  // The `large` property is the number of large items in stock.
  large: number;
}

// This interface defines the sizing information for an item.


export interface Isponsored {
  // The `item` property is the item that is sponsored.
  item: string | Iitem;// TcombinedProductClass;
  // The `discount` property is the discount that is applied to the item.
  discount: number;
}

// This interface defines the sponsored information for an item.
export interface IinventoryMeta {
  // The `date` property is the date of the inventory snapshot.
  date: Date;
  // The `quantity` property is the number of items in stock.
  quantity: number;
  // The `cost` property is the cost of the items in stock.
  cost: number;
}

// This interface defines the inventory information for an item.
