import { beforeAll, beforeEach, afterAll, vi, expect, describe, it } from 'vitest';
import { Application, Request, Response } from 'express';
import * as http from 'http';
import { createExpressServer } from '../../../../tests/helpers';
import { disconnectMongoose } from '@open-stock/stock-universal-server';
import { connectAuthDatabase } from '../../../src/stock-auth-local';
import { userLoginRelegator } from '../../../src/routes/user.routes';

describe('userLoginRelegator', () => {
  const dbUrl = 'mongodb://localhost:27017/node_testyyyyy';
  const apiUrl = '/auth';
  let app = Application;
  let server: http.Server;
  const token = 'token';
  const objectId = '507f1f77bcf86cd799439011';
  let request: Request;
  let response: Response;
  const univSend = vi.fn();

  beforeAll(async() => {
    app = createExpressServer();
    await connectAuthDatabase(dbUrl);
    server = app.listen(4301, () => {
      console.log('Server has started!');
    });
  });

  beforeEach(() => {
    // mock here
    request = {
      body: {}
    } as Request;
    response = {
      status: vi.fn(() => {
        return {
          send: univSend
        };
      })
    } as Response;
  });

  afterAll(async() => {
    await disconnectMongoose();
    server.close();
  });

  it('should return error if account does not exist', async() => {
    const spy = vi.spyOn(response, 'status');
    await userLoginRelegator(request, response);
    expect(spy).toHaveBeenCalledWith(404);
  });
});
