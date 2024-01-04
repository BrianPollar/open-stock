/* eslint-disable @typescript-eslint/ban-ts-comment */
import { vi, expect, describe, beforeEach, it } from 'vitest';
import { of } from 'rxjs';
import Axios from 'axios-observable';
import { faker } from '@faker-js/faker/locale/en_US';
import { Iauthresponse } from '@open-stock/stock-universal';
import { AuthController } from '../../../src/controllers/auth.controller';
import { createMockUser } from '../../../../tests/stock-auth-mocks';
import { StockAuthClient } from '../../../src/stock-auth-client';

describe('AuthController', () => {
  let instance: AuthController;
  const mockValue = {
    success: true,
    user: createMockUser(),
    token: faker.string.uuid(),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _id: faker.string.uuid()
  } as unknown as Iauthresponse;
  const userInfo = {
    emailPhone: 'string',
    password: 'string',
    firstName: 'string',
    lastName: 'string',
    url: './'
  };
  const axiosMock = {
    get: vi.fn().mockImplementation(() => of(null)),
    post: vi.fn().mockImplementation(() => of(null)),
    put: vi.fn().mockImplementation(() => of(null)),
    delete: vi.fn().mockImplementation(() => of(null))
  } as unknown as Axios;

  beforeEach(() => {
    new StockAuthClient(axiosMock);
    instance = new AuthController();
  });

  it('should have a constructor', () => {
    expect(instance.constructor).toBeDefined();
    // expect(ctrSpy).toHaveBeenCalled();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockAuthClient.logger).toBeDefined();
    expect(StockAuthClient.ehttp).toBeDefined();
  });

  it('its real instance of AuthController', () => {
    expect(instance).toBeInstanceOf(AuthController);
  });

  it('check authenticated', () => {
    expect(instance.isLoggedIn).toBe(false);
  });

  it('chech confirm enabled', () => {
    expect(instance.confirmEnabled).toBe(false);
  });

  it('should toogle confirmEnabled', () => {
    expect(instance.confirmEnabled = true).toBe(true);
    expect(instance.confirmEnabled = false).toBe(false);
  });

  it('should toogle isLoggedIn', () => {
    expect(instance.isLoggedIn = true).toBe(true);
    expect(instance.isLoggedIn = false).toBe(false);
  });

  it('should auto authenticate user with token user', async() => {
    const ehttpGetSpy = vi.spyOn(StockAuthClient.ehttp, 'makeGet').mockImplementationOnce(() => of(mockValue));
    expect(await instance.authenticateJwt()).toStrictEqual(mockValue);
    expect(ehttpGetSpy).toHaveBeenCalled();
  });

  it('should login user', async() => {
    const ehttpPostSpy = vi.spyOn(StockAuthClient.ehttp, 'makePost').mockImplementationOnce(() => of(mockValue));
    expect(await instance.login(userInfo)).toStrictEqual(mockValue);
    expect(ehttpPostSpy).toHaveBeenCalled();
  });

  it('should signup user', async() => {
    const ehttpPostSpy = vi.spyOn(StockAuthClient.ehttp, 'makePost').mockImplementationOnce(() => of(mockValue));
    expect(await instance.signup(userInfo)).toStrictEqual(mockValue);
    expect(ehttpPostSpy).toHaveBeenCalled();
  });

  it('should recover user', async() => {
    const ehttpPostSpy = vi.spyOn(StockAuthClient.ehttp, 'makePost').mockImplementationOnce(() => of(mockValue));
    expect(await instance.recover(userInfo)).toStrictEqual(mockValue);
    expect(ehttpPostSpy).toHaveBeenCalled();
  });

  it('should confirm user', async() => {
    const ehttpPostSpy = vi.spyOn(StockAuthClient.ehttp, 'makePost').mockImplementationOnce(() => of(mockValue));
    expect(await instance.confirm(userInfo, '/')).toStrictEqual(mockValue);
    expect(ehttpPostSpy).toHaveBeenCalled();
  });

  it('should make socialLogin', async() => {
    const ehttpPostSpy = vi.spyOn(StockAuthClient.ehttp, 'makePost').mockImplementationOnce(() => of(mockValue));
    expect(await instance.socialLogin(userInfo)).toStrictEqual(mockValue);
    expect(ehttpPostSpy).toHaveBeenCalled();
  });
});
