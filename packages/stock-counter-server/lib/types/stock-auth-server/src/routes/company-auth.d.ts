import { TsubscriptionFeature } from '@open-stock/stock-universal';
/**
 * Middleware that checks if the current user has the required subscription feature to access the requested resource.
 *
 * @param feature - The subscription feature that is required to access the resource.
 * @returns A middleware function that can be used in an Express route handler.
 */
export declare const requireCanUseFeature: (feature: TsubscriptionFeature) => (req: any, res: any, next: any) => Promise<any>;
/**
 * Middleware that checks if the current user's company is active.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the chain.
 * @returns Calls the next middleware function if the user's company is active, otherwise sends a 401 Unauthorized response.
 */
export declare const requireActiveCompany: (req: any, res: any, next: any) => any;
/**
 * Middleware that checks if the current user's company has a valid subscription for the given feature.
 *
 * @param feature - The type of subscription feature to check.
 * @returns A middleware function that:
 * - Checks if the user is a super admin, and if so, allows access.
 * - Finds the user's company's current subscription.
 * - Checks if the subscription is valid and the feature is available.
 * - If the feature is available, decrements the remaining size and updates the subscription.
 * - Returns a 200 OK response if the check passes, or a 401 Unauthorized response if the check fails.
 */
export declare const requireUpdateSubscriptionRecord: (feature: TsubscriptionFeature) => (req: any, res: any) => Promise<any>;
export declare const requireDeliveryMan: () => (req: any, res: any, next: any) => Promise<void>;
export declare const requireVendorManger: () => (req: any, res: any, next: any) => Promise<void>;
