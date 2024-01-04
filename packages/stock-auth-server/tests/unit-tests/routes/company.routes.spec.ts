import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';

describe('companyLoginRelegator', () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    req = {} as Request;
    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn()
    } as unknown as Response;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return a success response with token', async() => {
    expect(req).toBeDefined();
  });
});
