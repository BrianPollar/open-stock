import { vi, describe, it, expect } from 'vitest';
import { getEnvVar, getExpressLocals } from '../../../../stock-universal-server/src/constants/environment.constant';

describe('getEnvVar', () => {
  it('should get the environment variable named `name`', () => {
    const req = {
      localEnv: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        APP_NAME: 'My App'
      }
    };
    const next = vi.fn();
    const result = getEnvVar('APP_NAME')(req, {}, next);
    expect(result).toBe(req);
    expect(req.localEnv.APP_NAME).toBe('My App');
  });

  it('should get all of the environment variables in the array', () => {
    const req = {
      localEnv: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        APP_NAME: 'My App',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        PORT: 8080
      }
    };
    const next = vi.fn();
    const result = getEnvVar(['APP_NAME', 'PORT'])(req, {}, next);
    expect(result).toBe(req);
    expect(req.localEnv.APP_NAME).toBe('My App');
    expect(req.localEnv.PORT).toBe(8080);
  });
});

describe('getExpressLocals', () => {
  it('should get the Express locals variable named `name`', () => {
    const app = {
      locals: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        APP_NAME: 'My App'
      }
    };
    const result = getExpressLocals(app, 'APP_NAME');
    expect(result).toBe('My App');
  });
});
