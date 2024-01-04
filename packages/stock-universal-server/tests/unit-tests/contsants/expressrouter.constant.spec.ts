import { expect, describe, it } from 'vitest';
import { apiRouter, requireAuth, makeUrId } from '../../../../stock-universal-server/src/constants/expressrouter.constant';

describe('apiRouter', () => {
  it('should be an Express router object', () => {
    expect(apiRouter).toBeDefined();
    expect(apiRouter).toBeTruthy();
    expect(apiRouter).toBeInstanceOf(Object);
    // expect(apiRouter).toBeTypeOf(express.Router); // TODO how is this initialized? I mean express router
  });
});

describe('requireAuth', () => {
  it('should be a middleware function', () => {
    expect(requireAuth).toBeInstanceOf(Function);
  });

  /* // TODO tricky mostly determinant at runtime
  it('should require authentication', () => {
    const req = {
      auth: {
        token: 'my-token'
      }
    };
    const next = vi.fn();
    const result = requireAuth(req, {}, next);
    expect(result).toBe(req);
    expect(next).toBeCalledWith(req, {}, null);
  });

  it('should not require authentication if the token is not present', () => {
    const req = {};
    const next = vi.fn();
    const result = requireAuth(req, {}, next);
    expect(result).toBe(req);
    expect(next).toBeCalledWith(req, {}, new Error('Unauthorized'));
  });

  it('should authenticate using JWT strategy', () => {
    // Mock passport.authenticate function
    const passport = {
      authenticate: vi.fn()
    };

    // Import the requireAuth function from the file being tested
    const { requireAuth } = require('../../../../stock-universal-server/src/constants/expressrouter.constant');

    // Call the requireAuth function
    requireAuth();

    // Verify that passport.authenticate is called with the correct arguments
    expect(passport.authenticate).toHaveBeenCalledWith('jwt', { session: false });
  });*/
});

describe('makeUrId', () => {
  it('should generate a unique ID', () => {
    const lastPosition = 10;
    const result = makeUrId(lastPosition);
    expect(result).toBe('11');
  });
});
