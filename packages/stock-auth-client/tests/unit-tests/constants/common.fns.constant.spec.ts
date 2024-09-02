import { beforeEach, describe, expect, it } from 'vitest';
import { createMockUser } from '../../../../tests/stock-auth-mocks';
import { resolveImageUrl } from '../../../src/constants/common.fns.constant';
import { User } from '../../../src/defines/user.define';

describe('resolveImageUrl', () => {
  let userId: User;

  beforeEach(() => {
    userId = createMockUser();
  });

  it('should return the alternative image URL when userId is not an object', () => {
    const userId = '123';
    const alternativeImageUrl = 'https://example.com/default.jpg';
    const result = resolveImageUrl(userId, alternativeImageUrl);

    expect(result).toEqual(alternativeImageUrl);
  });

  it('should return the alternative image URL when property is not "photos" or "profileCoverPic"', () => {
    const alternativeImageUrl = 'https://example.com/default.jpg';
    const result = resolveImageUrl(userId, alternativeImageUrl, 'profilePic');

    expect(result).toEqual(userId.profilePic.url);
  });

  it('should return the alternative image URL when userId.photos is undefined', () => {
    const alternativeImageUrl = 'https://example.com/default.jpg';
    const result = resolveImageUrl(userId, alternativeImageUrl, 'photos');

    expect(result).toEqual(userId.photos[0].url);
  });

  it('should return the alternative image URL when userId.photos[photoPosition] is undefined', () => {
    const alternativeImageUrl = 'https://example.com/default.jpg';
    const result = resolveImageUrl(userId, alternativeImageUrl, 'photos', 0);

    expect(result).toEqual(userId.photos[0].url);
  });

  it('should return the URL of the specified photo when property is "photos" and userId.photos[photoPosition] exists', () => {
    const alternativeImageUrl = 'https://example.com/default.jpg';
    const result = resolveImageUrl(userId, alternativeImageUrl, 'photos', 1);

    expect(result).toEqual(userId.photos[1].url);
  });

  it('should return the URL of the profile cover pic when property is "profileCoverPic" and userId.profilePic.url exists', () => {
    const alternativeImageUrl = 'https://example.com/default.jpg';
    const result = resolveImageUrl(userId, alternativeImageUrl, 'profileCoverPic');

    expect(result).toEqual(userId.profileCoverPic.url);
  });

  it('should return the URL of the profile pic when property is "profilePic" and userId.profilePic.url exists', () => {
    const alternativeImageUrl = 'https://example.com/default.jpg';
    const result = resolveImageUrl(userId, alternativeImageUrl);

    expect(result).toEqual(userId.profilePic.url);
  });
});
