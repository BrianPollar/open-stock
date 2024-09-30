import { beforeAll, describe, expect, it, vi } from 'vitest';
import { getEnvVar, getExpressLocals } from '../../../../stock-universal-server/src/constants/environment.constant';

describe('getEnvVar', () => {
  beforeAll(() => {
    process.env.APP_NAME = 'My App';
    process.env.PORT = '8080';
  });

  it('should get the environment variable named `name`', () => {
    const req = {
      localEnv: {
        
        APP_NAME: 'My App'
      },
      env: {
        
        APP_NAME: 'My App'
      }
    };
    const next = vi.fn();

    getEnvVar('APP_NAME')(req: IcustomRequest<never, unknown>, {}, next);
    expect(req.localEnv).toStrictEqual(req.env);
    console.log('modified', req.localEnv);
    expect(req.localEnv.APP_NAME).toBe('My App');
  });

  it('should get all of the environment variables in the array', () => {
    const req = {
      env: {
        
        APP_NAME: 'My App',
        
        PORT: '8080'
      }
    };
    const next = vi.fn();

    getEnvVar(['APP_NAME', 'PORT'])(req: IcustomRequest<never, unknown>, {}, next);
    expect(req.env.APP_NAME).toBe('My App');
    expect(req.env.PORT).toBe('8080');
  });
});

describe('getExpressLocals', () => {
  it('should get the Express locals variable named `name`', () => {
    const app = {
      locals: {
        
        APP_NAME: 'My App'
      }
    };
    const result = getExpressLocals(app, 'APP_NAME');

    expect(result).toBe('My App');
  });
});
