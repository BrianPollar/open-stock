import { vi, expect, describe, it } from 'vitest';
import { apiRouter, requireAuth, makeUrId } from '../../../../stock-universal-server/src/constants/expressrouter.constant';
import express from 'express';

describe('apiRouter', () => {
  it('should be an Express router object', () => {
    expect(apiRouter).toBeInstanceOf(express.Router);
  });
});

describe('requireAuth', () => {
  it('should be a middleware function', () => {
    expect(requireAuth).toBeInstanceOf(Function);
  });

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
});

describe('makeUrId', () => {
  it('should generate a unique ID', () => {
    const lastPosition = 10;
    const result = makeUrId(lastPosition);
    expect(result).toBe('11');
  });
});
