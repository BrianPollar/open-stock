import { PesaPalController } from 'pesapal3';
import { IstockcounterServerConfig, runStockCounterServer } from '../../src/stock-counter-server';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

const mocks = vi.hoisted(() => {
  return {
    isAuthServerRunning: vi.fn(),
    connectStockCounterDatabase: vi.fn()
  };
});

vi.mock('../../src/stock-counter-server', async() => {
  const actual: object = await vi.importActual('../../src/stock-counter-server');
  return {
    ...actual,
    isAuthServerRunning: mocks.isAuthServerRunning,
    connectStockCounterDatabase: mocks.connectStockCounterDatabase
  };
});

describe('runStockCounterServer', () => {
  let config: IstockcounterServerConfig;
  let paymentInstance: PesaPalController;

  beforeEach(() => {
    config = {
      databaseConfigUrl: 'mongodb://localhost:27017/stock-counter',
      authSecrets: {
        jwtSecret: 'secret',
        cookieSecret: 'secret'
      },
      pesapalNotificationRedirectUrl: 'https://example.com/redirect',
      localPath: {
        absolutepath: './',
        photoDirectory: './',
        videoDirectory: './'
      }
    };

    paymentInstance = new PesaPalController();
  });

  afterEach(() => {
    // Clean up any resources used by the tests
  });

  it('should throw an error if the auth server is not running', async() => {
    // Mock the isAuthServerRunning function to return false
    // vi.spyOn(auth, 'isAuthServerRunning').mockReturnValue(false);
    await expect(runStockCounterServer(config, paymentInstance)).rejects.toThrowError(
      'Auth server is not running, please start by firing up that server'
    );
  });
});
