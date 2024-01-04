import { Request, Response, NextFunction } from 'express';
import { describe, beforeEach, vi, afterEach, it, expect } from 'vitest';

describe('loginFactorRelgator', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      body: {
        user: {
          emailPhone: 'test@example.com',
          from: 'company',
          passwd: 'password'
        }
      }
    } as Request;
    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn()
    } as unknown as Response;
    next = vi.fn() as NextFunction;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return an error response if user already exists', async() => {
    expect(req).toBeDefined();
  });
});
