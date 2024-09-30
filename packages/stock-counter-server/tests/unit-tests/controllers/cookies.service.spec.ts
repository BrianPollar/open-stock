import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeRecentCookie } from '../../../src/controllers/cookies.service';

describe('makeRecentCookie', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {
        recentCookie: ['cookie1', 'cookie2', 'cookie3']
      }
    };
    res = {
      cookie: vi.fn(),
      status: vi.fn().mockReturnThis(),
      send: vi.fn()
    };
  });

  it('should set the recent cookie with the provided value', () => {
    makeRecentCookie(req: IcustomRequest<never, unknown>, res);

    expect(res.cookie).toHaveBeenCalledWith('recent', req.body.recentCookie, {
      expires: expect.any(Date),
      secure: true,
      httpOnly: false,
      sameSite: 'none',
      signed: true
    });
  });

  it('should return a success response', () => {
    makeRecentCookie(req: IcustomRequest<never, unknown>, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ success: true });
  });
});
