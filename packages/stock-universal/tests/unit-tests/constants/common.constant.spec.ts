import { describe, expect, it } from 'vitest';
import { paymentMethod } from '../../../src/constants/common.constant';

describe('paymentMethod', () => {
  it('should contain the correct payment methods', () => {
    const expectedPaymentMethods = [
      {
        name: 'Airtel Money',
        value: 'airtelmoney'
      },
      {
        name: 'Mtn Momo',
        value: 'momo'
      },
      {
        name: 'Cash',
        value: 'cash'
      },
      {
        name: 'Cheque',
        value: 'cheque'
      },
      {
        name: 'Credit',
        value: 'credit'
      }
    ];

    expect(paymentMethod).toEqual(expectedPaymentMethods);
  });
});
