import { describe, expect, it, vi } from 'vitest';
import { runStockUniversalServer } from '../../src/stock-universal-server';

vi.mock('../../src/stock-universal-local', async() => {
  const actual: object = await vi.importActual('../../src/stock-universal-local');

  return {
    ...actual,
    connectUniversalDatabase: vi.fn(),
    isStockUniversalServerRunning: true
  };
});

vi.mock('../../src/stock-universal-server', async() => {
  const actual: object = await vi.importActual('../../src/stock-universal-server');

  return {
    ...actual,
    isUniversalServerRunning: vi.fn().mockReturnValue(true)
  };
});

describe('runStockUniversalServer', () => {
  it('should return a promise resolving to an object with isStockUniversalServerRunning property', async() => {
    const databaseConfigUrl = 'your-database-config-url';
    const result = await runStockUniversalServer(databaseConfigUrl);

    expect(result).toEqual({ isStockUniversalServerRunning: true });
  });
});
