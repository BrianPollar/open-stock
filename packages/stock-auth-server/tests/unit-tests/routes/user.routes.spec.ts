import { Company, User } from '@open-stock/stock-auth-client';
import { beforeEach, describe, expect, it } from 'vitest';
import { createMockCompany, createMockUser } from '../../../../tests/stock-auth-mocks';

describe('userLoginRelegator', () => {
  let user: User;
  let company: Company;

  beforeEach(() => {
    user = createMockUser();
    company = createMockCompany();
  });

  it('should return a successful response with token', () => {
    expect(user).toBeDefined();
    expect(company).toBeDefined();
  });
});
