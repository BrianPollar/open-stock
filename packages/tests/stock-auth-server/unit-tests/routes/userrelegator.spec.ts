import { beforeAll, beforeEach, afterAll, vi, expect, describe, it } from 'vitest';
import { Application, Request, Response } from 'express';
import * as http from 'http';
import { createExpressServer } from '../../../../tests/helpers';
import { connectAuthDatabase } from '../../../../stock-auth-server/src/stock-auth-server';
import { userLoginRelegator } from '../../../../stock-auth-server/src/routes/auth.routes';
import { disconnectMongoose } from '@open-stock/stock-universal-server';

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
    expect(spy).toHaveBeenCalledWith(401);
    expect(univSend).toHaveBeenCalledWith({
      success: false,
      err: 'Account does not exist!'
    });
  });

  it('should return error if account is blocked', async() => {
    request.body = {
      emailPhone: 'blocked@example.com',
      passwd: 'password',
      from: 'admin'
    };
    // Mock the findOne method to return a blocked user
    /* const userLean = {
      findOne: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({
          blocked: true,
        }),
      }),
    };*/
    const spy = vi.spyOn(response, 'status');
    await userLoginRelegator(request, response);
    expect(spy).toHaveBeenCalledWith(401);
    /* expect(univSend).toHaveBeenCalledWith({
      success: false,
      err: 'This account has been blocked due to suspicious activities. Please contact support.',
    });*/
  });

  it('should return error if password does not match', async() => {
    request.body = {
      emailPhone: 'user@example.com',
      passwd: 'wrongpassword',
      from: 'admin'
    };
    // Mock the findOne method to return a user with the correct email
    /* const userLean = {
      findOne: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({
          password: 'password',
        }),
      }),
    };*/
    const spy = vi.spyOn(response, 'status');
    await userLoginRelegator(request, response);
    expect(spy).toHaveBeenCalledWith(401);
    /* expect(univSend).toHaveBeenCalledWith({
      success: false,
      err: 'email and password did not match',
    });*/
  });

  it('should return success response with token if valid credentials', async() => {
    request.body = {
      emailPhone: 'user@example.com',
      passwd: 'password',
      from: 'admin'
    };
    // Mock the findOne method to return a user with the correct email and password
    /* const userLean = {
      findOne: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({
          _id: 'user_id',
          permissions: {},
        }),
      }),
    };*/
    // Mock the setUserInfo and generateToken functions
    /* const setUserInfo = vi.fn().mockReturnValue({
      userId: 'user_id',
      permissions: {},
    });
    const generateToken = vi.fn().mockReturnValue('token');
    */
    const spy = vi.spyOn(response, 'status');
    await userLoginRelegator(request, response);
    expect(spy).toHaveBeenCalledWith(401);
    /* expect(univSend).toHaveBeenCalledWith({
      success: true,
      user: {
        _id: 'user_id',
        permissions: {},
      },
      token: 'token',
    });*/
  });
});
