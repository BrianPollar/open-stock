import { describe, it, expect, beforeEach } from 'vitest';
import { Company } from '../../../src/defines/company.define';
import { createMockCompany } from '../../../../tests/stock-auth-mocks';
import { Icompany } from '@open-stock/stock-universal';

describe('Company', () => {
  let company: Company;

  beforeEach(() => {
    company = createMockCompany();
  });

  it('should create a new Company instance with the provided data', () => {
    expect(company).toBeInstanceOf(Company);
  });

  it('should append update the company object with the provided data', () => {
    const data: Icompany = {
      displayName: 'Updated Company',
      details: 'Updated details',
      websiteAddress: 'https://www.updatedcompany.com'
    } as unknown as Icompany;
    company.appendUpdate(data);
    expect(company.displayName).toEqual(data.displayName);
    expect(company.details).toEqual(data.details);
    // expect(company.profilePic).toEqual(data.profilePic);
    expect(company.websiteAddress).toEqual(data.websiteAddress);
  });
});
