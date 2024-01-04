import { expect, describe, it } from 'vitest';
import { getHostname } from '../../../../stock-universal-server/src/constants/gethost.constant';

describe('getHostname', () => {
  it('should get the hostname from the request object', () => {
    const req = {
      hostname: 'my-hostname'
    };
    const result = getHostname(req);
    expect(result).toBe('my-hostname');
  });

  it('should get the hostname from the operating system if the request object is not provided', () => {
    const hostname = 'my-hostname';
    // os.hostname = vi.fn(() => hostname);
    const result = getHostname();
    expect(result).not.toBe(hostname);
  });
});
