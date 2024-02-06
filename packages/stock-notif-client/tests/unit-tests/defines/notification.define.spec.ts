import { vi, expect, describe, beforeEach, it, expectTypeOf } from 'vitest';
import { NotificationMain } from '../../../../stock-notif-client/src/defines/notification.define';
import { StockNotifClient } from '../../../../stock-notif-client/src/stock-notif-client';
import { of } from 'rxjs';
import Axios from 'axios-observable';
import { createMockNotif, createMockNotifs } from '../../../../tests/stock-notif-mocks';

describe('NotificationMain', () => {
  let instance: NotificationMain;
  const axiosMock = {} as Axios;
  const companyId = 'companyid';

  beforeEach(() => {
    new StockNotifClient(axiosMock);
    instance = createMockNotif();
  });

  it('#StockNotifClient should have all callable static properties', () => {
    expect(StockNotifClient.ehttp).toBeDefined();
    expect(StockNotifClient.logger).toBeDefined();
  });

  it('should have properties defined', () => {
    expect(instance).toBeInstanceOf(NotificationMain);
    // expect(instance._id).toBeDefined();
    /*
    expect(instance.actions).toBeDefined();
    expect(instance.userId).toBeDefined();
    expect(instance.title).toBeDefined();
    expect(instance.body).toBeDefined();
    expect(instance.icon).toBeDefined();
    expect(instance.notifType).toBeDefined();
    expect(instance.notifInvokerId).toBeDefined();
    expect(instance.expireAt).toBeDefined();
    expect(instance.createdAt).toBeDefined();
    */
  });

  it('#getNotifications static should get NotificationMains array', async() => {
    const lSpy = vi.spyOn(StockNotifClient.ehttp, 'makeGet').mockImplementationOnce(() => of(createMockNotifs(10)));
    const list = await NotificationMain.getNotifications(companyId, '/', 0, 0);
    expect(typeof list).toEqual('object');
    expectTypeOf(list).toEqualTypeOf<NotificationMain[]>([]);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#creatNotifs static should add one NotificationMain', async() => {
    const lSpy = vi.spyOn(StockNotifClient.ehttp, 'makePost').mockImplementationOnce(() => of(createMockNotif()));
    const one = await NotificationMain.creatNotifs(companyId, createMockNotif());
    expect(typeof one).toEqual('object');
    expect(one).toBeInstanceOf(NotificationMain);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#appendSubscription static should append subscription', async() => {
    const lSpy = vi.spyOn(StockNotifClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const appended = await NotificationMain.appendSubscription(companyId, null);
    expect(typeof appended).toEqual('object');
    expect(appended).toHaveProperty('success');
    expect(appended.success).toEqual(true);
    expect(typeof appended.success).toEqual('boolean');
    expectTypeOf(appended.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#getUnviewedLength static should get unviewed notifications length', async() => {
    const lSpy = vi.spyOn(StockNotifClient.ehttp, 'makeGet').mockImplementationOnce(() => of(64));
    const long = await NotificationMain.getUnviewedLength(companyId);
    expect(typeof long).toEqual('number');
    expect(long).toBe(64);
    expect(lSpy).toHaveBeenCalled();
  });

  it('#clearAll static should clear all notifications', async() => {
    const lSpy = vi.spyOn(StockNotifClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const cleared = await NotificationMain.clearAll(companyId);
    expect(typeof cleared).toEqual('object');
    expect(cleared).toHaveProperty('success');
    expect(cleared.success).toEqual(true);
    expect(typeof cleared.success).toEqual('boolean');
    expectTypeOf(cleared.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });

  it('#updateViewed should update viewed notifications', async() => {
    const lSpy = vi.spyOn(StockNotifClient.ehttp, 'makePost').mockImplementationOnce(() => of({ success: true }));
    const updated = await instance.updateViewed(companyId);
    expect(typeof updated).toEqual('object');
    expect(updated).toHaveProperty('success');
    expect(updated.success).toEqual(true);
    expect(typeof updated.success).toBe('boolean');
    expectTypeOf(updated.success).toEqualTypeOf<boolean>(Boolean('true'));
    expect(lSpy).toHaveBeenCalled();
  });
});
