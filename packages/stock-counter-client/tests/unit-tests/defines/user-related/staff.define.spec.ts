import { IdeleteCredentialsLocalUser, IfileMeta, Istaff } from '@open-stock/stock-universal';
import Axios from 'axios-observable';
import { of } from 'rxjs';
import { beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { Staff } from '../../../../../stock-counter-client/src/defines/user-related/staff.define';
import { StockCounterClient } from '../../../../../stock-counter-client/src/stock-counter-client';
import { createMockDeleteCredentialsLocalUser } from '../../../../../tests/stock-auth-mocks';
import { createMockStaff, createMockStaffs } from '../../../../../tests/stock-counter-mocks';

describe('Staff', () => {
  let instance: Staff;
  const axiosMock = {} as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockCounterClient(axiosMock);
    instance = createMockStaff();
  });

  it('#StockCounterClient should have all callable static properties', () => {
    expect(StockCounterClient.calcCtrl).toBeDefined();
    expect(StockCounterClient.ehttp).toBeDefined();
    expect(StockCounterClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(Staff);
    expect(instance._id).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    expect(instance.updatedAt).toBeDefined();
    expect(instance.employmentType).toBeDefined();
    expect(instance.salary).toBeDefined();
  });

  it('#getStaffs static should get Staffs array', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockStaffs(10)));
    const list = await Staff.getStaffs(companyId, 0, 0);

    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<Staff[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getStaffByRole static should get Staffs array by role', async() => {
    const role = 'role';
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockStaffs(10)));
    const list = await Staff.getStaffByRole(companyId, role, 0, 0);

    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<Staff[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getOneStaff static should get one Staff', async() => {
    const id = 'urId';
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockStaff()));
    const one = await Staff.getOneStaff(companyId, id);

    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(Staff);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#createStaff static should add one Staff', async() => {
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const added = await Staff.createStaff(companyId, createMockStaff() as Istaff);

    expect(typeof added).toEqual('object');
    expect(added).toHaveProperty('success');
    expect(added.success).toEqual(true);
    expect(typeof added.success).toBe('boolean');
    expectTypeOf(added.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteStaffs static should delete many Staffs', async() => {
    const credentials: IdeleteCredentialsLocalUser[] = [];
    const filesWithDir: IfileMeta[] = [];
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await Staff.deleteStaffs(companyId, credentials, filesWithDir);

    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#updateStaff should update Staff', async() => {
    const vals = createMockStaff() as Istaff;
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const updated = await instance.updateStaff(companyId, vals);

    expect(typeof updated).toEqual('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#deleteStaff should delete Staff', async() => {
    const credential: IdeleteCredentialsLocalUser = createMockDeleteCredentialsLocalUser();
    const filesWithDir: IfileMeta[] = [];
    const lSpy = vi.spyOn(StockCounterClient.ehttp, 'makePut').mockImplementationOnce(() => of({ success: true }));
    const deleted = await instance.deleteStaff(companyId, credential, filesWithDir);

    expect(typeof deleted).toEqual('object');
    expect(deleted).toHaveProperty('success');
    expect(deleted.success).toEqual(true);
    expect(typeof deleted.success).toBe('boolean');
    expectTypeOf(deleted.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
