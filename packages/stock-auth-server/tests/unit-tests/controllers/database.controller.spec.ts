import { disconnectMongoose, makeNewConnection } from '@open-stock/stock-universal-server';
import { Connection } from 'mongoose';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('makeNewConnection auth', () => {
  const dbUrl = 'mongodb://localhost:27017/node_testyyyyy';
  let mainConnection: Connection;
  let mainConnectionLean: Connection;

  beforeAll(async() => {
    mainConnection = await makeNewConnection(dbUrl, 'main');
    mainConnectionLean = await makeNewConnection(dbUrl, 'lean');
  });

  it('should create a main mongoose connection', () => {
    expect(mainConnection).toBeDefined();
    expect(mainConnection).toBeInstanceOf(Connection);
  });

  it('should create a lean mongoose connection', () => {
    expect(mainConnectionLean).toBeDefined();
    expect(mainConnectionLean).toBeInstanceOf(Connection);
  });

  afterAll(async() => {
    const closed = await Promise.all([
      mainConnection.close(true),
      // lean
      mainConnectionLean.close(true)
    ]).catch(err => {
      return err;
    });

    expect(typeof closed).toBe('object');
    expect(typeof closed[0]).toBe('object');
    await disconnectMongoose();
  });
});

