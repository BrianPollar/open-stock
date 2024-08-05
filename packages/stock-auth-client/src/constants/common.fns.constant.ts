import { User } from '../defines/user.define';

/**
 * Resolves the URID of a user.
 * @param userId - The user object or user ID.
 * @returns The URID of the user.
 */
export const resolveUserUrId = (userId: User | string): string => (userId as User)?.urId || (userId as string);

/**
 * Resolves the image URL based on the provided parameters.
 * @param userId - The user ID or user object.
 * @param alterenativeImageUrl - The alternative image URL to use if the user's image is not available.
 * @param property - The property to retrieve the image URL from. Defaults to 'profilePic'.
 * @param photoPosition - The position of the photo in the 'photos' array. Only applicable if 'property' is set to 'photos'. Defaults to 0.
 * @returns The resolved image URL.
 */
export const resolveImageUrl = (
  userId: User | string,
  alterenativeImageUrl: string,
  property: 'profilePic' | 'profileCoverPic' | 'photos' = 'profilePic',
  photoPosition = 0
): string => {
  if (property === 'photos') {
    return (userId as User)?.photos[photoPosition]?.url || alterenativeImageUrl;
  } else if (property === 'profileCoverPic') {
    return (userId as User)?.profileCoverPic?.url || alterenativeImageUrl;
  } else {
    return (userId as User)?.profilePic?.url || alterenativeImageUrl;
  }
};

/**
 * Resolves the user name based on the provided user ID.
 * @param userId - The user ID or User object.
 * @returns The resolved user name.
 */
export const resolveUserName = (userId: User | string) => {
  return typeof userId === 'string' ? userId : (userId).names;
};
