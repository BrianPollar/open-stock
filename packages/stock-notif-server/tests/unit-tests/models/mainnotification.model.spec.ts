import { IMainnotification } from '../../../src/models/mainnotification.model';
import { describe, it, expect } from 'vitest';

describe('IMainnotification', () => {
  it('should have actions property of type Iactionwithall[]', () => {
    const mainnotification: IMainnotification = {
      actions: [],
      userId: 'user123',
      title: 'Notification Title',
      body: 'Notification Body',
      icon: 'notification-icon',
      expireAt: 1234567890,
      notifType: 'orders',
      notifInvokerId: 'invoker123',
      active: true,
      viewed: []
    } as unknown as IMainnotification;

    expect(mainnotification.actions).toEqual([]);
  });

  it('should have userId property of type string', () => {
    const mainnotification: IMainnotification = {
      actions: [],
      userId: 'user123',
      title: 'Notification Title',
      body: 'Notification Body',
      icon: 'notification-icon',
      expireAt: 1234567890,
      notifType: 'orders',
      notifInvokerId: 'invoker123',
      active: true,
      viewed: []
    } as unknown as IMainnotification;
    expect(mainnotification.userId).toEqual('user123');
  });

  it('should have title property of type string', () => {
    const mainnotification: IMainnotification = {
      actions: [],
      userId: 'user123',
      title: 'Notification Title',
      body: 'Notification Body',
      icon: 'notification-icon',
      expireAt: 1234567890,
      notifType: 'orders',
      notifInvokerId: 'invoker123',
      active: true,
      viewed: []
    } as unknown as IMainnotification;
    expect(mainnotification.title).toEqual('Notification Title');
  });

  it('should have body property of type string', () => {
    const mainnotification: IMainnotification = {
      actions: [],
      userId: 'user123',
      title: 'Notification Title',
      body: 'Notification Body',
      icon: 'notification-icon',
      expireAt: 1234567890,
      notifType: 'orders',
      notifInvokerId: 'invoker123',
      active: true,
      viewed: []
    } as unknown as IMainnotification;
    expect(mainnotification.body).toEqual('Notification Body');
  });

  it('should have icon property of type string', () => {
    const mainnotification: IMainnotification = {
      actions: [],
      userId: 'user123',
      title: 'Notification Title',
      body: 'Notification Body',
      icon: 'notification-icon',
      expireAt: 1234567890,
      notifType: 'orders',
      notifInvokerId: 'invoker123',
      active: true,
      viewed: []
    } as unknown as IMainnotification;
    expect(mainnotification.icon).toEqual('notification-icon');
  });

  it('should have expireAt property of type number', () => {
    const mainnotification: IMainnotification = {
      actions: [],
      userId: 'user123',
      title: 'Notification Title',
      body: 'Notification Body',
      icon: 'notification-icon',
      expireAt: 1234567890,
      notifType: 'orders',
      notifInvokerId: 'invoker123',
      active: true,
      viewed: []
    } as unknown as IMainnotification;
    expect(mainnotification.expireAt).toEqual(1234567890);
  });

  it('should have notifType property of type TnotifType', () => {
    const mainnotification: IMainnotification = {
      actions: [],
      userId: 'user123',
      title: 'Notification Title',
      body: 'Notification Body',
      icon: 'notification-icon',
      expireAt: 1234567890,
      notifType: 'orders',
      notifInvokerId: 'invoker123',
      active: true,
      viewed: []
    } as unknown as IMainnotification;
    expect(mainnotification.notifType).toEqual('orders');
  });

  it('should have notifInvokerId property of type string', () => {
    const mainnotification: IMainnotification = {
      actions: [],
      userId: 'user123',
      title: 'Notification Title',
      body: 'Notification Body',
      icon: 'notification-icon',
      expireAt: 1234567890,
      notifType: 'orders',
      notifInvokerId: 'invoker123',
      active: true,
      viewed: []
    } as unknown as IMainnotification;
    expect(mainnotification.notifInvokerId).toEqual('invoker123');
  });

  it('should have active property of type boolean', () => {
    const mainnotification: IMainnotification = {
      actions: [],
      userId: 'user123',
      title: 'Notification Title',
      body: 'Notification Body',
      icon: 'notification-icon',
      expireAt: 1234567890,
      notifType: 'orders',
      notifInvokerId: 'invoker123',
      active: true,
      viewed: []
    } as unknown as IMainnotification;
    expect(mainnotification.active).toEqual(true);
  });

  it('should have viewed property of type string[]', () => {
    const mainnotification: IMainnotification = {
      actions: [],
      userId: 'user123',
      title: 'Notification Title',
      body: 'Notification Body',
      icon: 'notification-icon',
      expireAt: 1234567890,
      notifType: 'orders',
      notifInvokerId: 'invoker123',
      active: true,
      viewed: []
    } as unknown as IMainnotification;
    expect(mainnotification.viewed).toEqual([]);
  });
});
