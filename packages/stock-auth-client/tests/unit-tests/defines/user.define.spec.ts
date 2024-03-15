import { Iuser } from '@open-stock/stock-universal';
import Axios from 'axios-observable';
import { of } from 'rxjs';
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { User } from '../../../../stock-auth-client/src/defines/user.define';
import { StockAuthClient } from '../../../../stock-auth-client/src/stock-auth-client';
import { createMockAddress, createMockUser, createMockUserperm, createMockUsers } from '../../../../tests/stock-auth-mocks';

describe('User', () => {
  let instance: User;
  const companyId = 'companyId';
  const axiosMock = {
    get: vi.fn().mockImplementation(() => of({ data: { data: 'data' } })),
    post: vi.fn().mockImplementation(() => of({ data: { data: 'data' } })),
    put: vi.fn().mockImplementation(() => of({ data: { data: 'data' } })),
    delete: vi.fn().mockImplementation(() => of({ data: { data: 'data' } }))
  } as unknown as Axios;

  beforeEach(() => {
    instance = createMockUser();
    new StockAuthClient(axiosMock);
    StockAuthClient.ehttp.makeGet = vi.fn().mockImplementation(() => of({ data: { data: 'data' } }));
    StockAuthClient.ehttp.makePost = vi.fn().mockImplementation(() => of({ data: { data: 'data' } }));
    StockAuthClient.ehttp.makePut = vi.fn().mockImplementation(() => of({ data: { data: 'data' } }));
    StockAuthClient.ehttp.makeDelete = vi.fn().mockImplementation(() => of({ data: { data: 'data' } }));
    // User.getUsers = vi.fn().mockReturnValue(createMockUsers(10));
  });

  it('should get the current user', () => {
    expect(instance).toBeInstanceOf(User);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.urId).toBeDefined();
    expect(instance.names).toBeDefined();
    expect(instance.lname).toBeDefined();
    expect(instance.companyName).toBeDefined();
    expect(instance.email).toBeDefined();
    expect(instance.address).toBeDefined();
    expect(instance.billing).toBeDefined();
    expect(instance.uid).toBeDefined();
    expect(instance.did).toBeDefined();
    expect(instance.aid).toBeDefined();
    expect(instance.photos).toBeDefined();
    expect(instance.admin).toBeDefined();
    expect(instance.subAdmin).toBeDefined();
    expect(instance.permissions).toBeDefined();
    expect(instance.phone).toBeDefined();
    expect(instance.amountDue).toBeDefined();
    expect(instance.manuallyAdded).toBeDefined();
    expect(instance.online).toBeDefined();
  });

  it('#getUsers static should get User array', async() => {
    const lSpy = vi.spyOn(StockAuthClient.ehttp, 'makeGet').mockImplementation(() => of(createMockUsers(10)));
    const list = await User.getUsers(companyId, '/', 0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<User[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneUser static should get one User', async() => {
    const lSpy = vi.spyOn(StockAuthClient.ehttp, 'makeGet').mockImplementation(() => of(createMockUser()));
    const one = await User.getOneUser(companyId, 'urId');
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(User);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#addUser static should add one user', async() => {
    const lSpy = vi.spyOn(StockAuthClient.ehttp, 'makePost').mockImplementation(() => of({ success: true }));
    const added = await User.addUser(companyId, createMockUser() as unknown as Iuser);
    expect(typeof added).toBe('object');
    expect(added).toMatchObject({ success: true });
    // expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteUsers static should delete many users', async() => {
    const lSpy = vi.spyOn(StockAuthClient.ehttp, 'makePut').mockImplementation(() => of({ success: true }));
    const deleted = await User.deleteUsers(companyId, ['ids'], []);
    expect(typeof deleted).toBe('object');
    // expect(deleted).toHaveProperty('success');
    // expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#updateUserBulk static should update user bulk', async() => {
    const lSpy = vi.spyOn(StockAuthClient.ehttp, 'makePut').mockImplementation(() => of({ success: true }));
    const updated = await instance.updateUserBulk(companyId, createMockUser() as unknown as Iuser);
    expect(typeof updated).toBe('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#updateUser should update user', async() => {
    const lSpy = vi.spyOn(StockAuthClient.ehttp, 'makePut').mockImplementation(() => of({ success: true }));
    const updated = await instance.updateUser(companyId, createMockUser(), 'all');
    expect(typeof updated).toBe('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#manageAddress should manage address', async() => {
    const lSpy = vi.spyOn(StockAuthClient.ehttp, 'makePut').mockImplementation(() => of({ success: true }));
    const updated = await instance.manageAddress(companyId, createMockAddress());
    expect(typeof updated).toBe('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#managePermission should manage permisssions', async() => {
    const lSpy = vi.spyOn(StockAuthClient.ehttp, 'makePut').mockImplementation(() => of({ success: true }));
    const updated = await instance.managePermission(companyId, createMockUserperm());
    expect(typeof updated).toBe('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteUser should delete user', async() => {
    const lSpy = vi.spyOn(StockAuthClient.ehttp, 'makePut').mockImplementation(() => of({ success: true }));
    const deleted = await instance.deleteUser(companyId);
    expect(typeof deleted).toBe('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
