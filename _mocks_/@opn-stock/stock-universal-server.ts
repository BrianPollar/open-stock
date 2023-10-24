/* eslint-disable @typescript-eslint/ban-ts-comment */
import { vi } from 'vitest';

const stockUniversalServer = vi.hoisted(async() => {
  const actual = await vi.importActual('@open-stock/stock-universal-server');
  return {
    // @ts-ignore
    ...actual,
    requireAuth: vi.fn((req, res, next) => {
      req.user = {
        userId: 'string',
        permissions: {
          orders: true,
          payments: true,
          users: true,
          items: true,
          faqs: true,
          videos: true,
          printables: true,
          buyer: true
        }
      };
      next();
    })
  };
});
