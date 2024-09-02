import { User } from '../defines/user.define';
/**
 * Resolves the URID of a user.
 * @param userId - The user object or user ID.
 * @returns The URID of the user.
 */
export declare const resolveUserUrId: (userId: User | string) => string;
/**
 * Resolves the image URL based on the provided parameters.
 * @param userId - The user ID or user object.
 * @param alterenativeImageUrl - The alternative image URL to use if the user's image is not available.
 * @param property - The property to retrieve the image URL from. Defaults to 'profilePic'.
 * @param photoPosition - The position of the photo in the 'photos' array. Only applicable if 'property' is set to 'photos'. Defaults to 0.
 * @returns The resolved image URL.
 */
export declare const resolveImageUrl: (userId: User | string, alterenativeImageUrl: string, property?: 'profilePic' | 'profileCoverPic' | 'photos', photoPosition?: number) => string;
/**
 * Resolves the user name based on the provided user ID.
 * @param userId - The user ID or User object.
 * @returns The resolved user name.
 */
export declare const resolveUserName: (userId: User | string) => string;
