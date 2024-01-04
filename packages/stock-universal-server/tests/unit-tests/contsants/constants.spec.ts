/* eslint-disable no-undefined */
import { expect, describe, it, beforeEach } from 'vitest';
import { getEnvVar, getExpressLocals } from '../../../../stock-universal-server/src/constants/environment.constant';
import { makeUrId } from '../../../../stock-universal-server/src/constants/expressrouter.constant';
import { getHostname } from '../../../../stock-universal-server/src/constants/gethost.constant';
import { offsetLimitRelegator } from '../../../../stock-universal-server/src/constants/offsetlimitrelegator.constant';
import { Application } from 'express';

const expressAppMock = {
  locals: { }
};

describe('constants', () => {
  let app: Application;

  beforeEach(() => {
    app = expressAppMock;
  });

  it('its real instance of AuthController', () => {
    expect(typeof getEnvVar('all')).toBe('function');
  });

  it('check authenticated', () => {
    expect(getExpressLocals(app, 'all')).toBe(undefined);
  });

  it('check authenticated', () => {
    expect(makeUrId(1)).toStrictEqual((2).toString());
  });

  it('check authenticated', () => {
    expect(typeof getHostname()).toBe('string');
  });

  it('check authenticated', () => {
    expect(offsetLimitRelegator(0, 0)).toStrictEqual({ offset: 10000, limit: 10000 });
  });

  it('check authenticated', () => {
    expect(offsetLimitRelegator(10, 10)).toStrictEqual({ offset: 10, limit: 10 });
  });
});
