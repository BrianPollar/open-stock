import { beforeEach, describe, expect, it, vi } from 'vitest';
import { roleAuthorisation } from '../../../src/controllers/passport.service';

describe('roleAuthorisation', () => {
  const mockRequest = {
    user: {
      permissions: {
        admin: {
          canAccess: true
        }
      }
    }
  };

  const mockResponse = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn()
  };

  const mockNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call next middleware function if user has required permission', () => {
    const mockRequest = {
      user: {
        permissions: {
          orders: {
            create: true
          }
        }
      }
    };
    const middleware = roleAuthorisation('orders', 'create');

    middleware(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.send).not.toHaveBeenCalled();
  });

  it('should return 401 Unauthorized error if user does not have required permission', () => {
    const middleware = roleAuthorisation('orders', 'create');

    middleware(mockRequest, mockResponse, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.send).toHaveBeenCalledWith('unauthorised');
  });
});
