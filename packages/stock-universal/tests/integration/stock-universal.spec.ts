import { describe, it, expect } from 'vitest';
import { IenvironmentConfig } from '../../src/stock-universal';

describe('IenvironmentConfig', () => {
  it('should have the correct properties', () => {
    const config: IenvironmentConfig = {
      appName: 'Test App',
      photoDirectory: '/path/to/photos',
      videoDirectory: '/path/to/videos',
      absolutepath: '/path/to/app'
    };
    expect(config.appName).toBe('Test App');
    expect(config.photoDirectory).toBe('/path/to/photos');
    expect(config.videoDirectory).toBe('/path/to/videos');
    expect(config.absolutepath).toBe('/path/to/app');
  });
});
