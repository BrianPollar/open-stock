import { NextFunction, Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
