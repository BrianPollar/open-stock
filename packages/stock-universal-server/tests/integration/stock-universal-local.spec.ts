import { vi, describe, it, expect } from 'vitest';
import { connectUniversalDatabase } from '../../src/stock-universal-local';
import { createFileMetaModel } from '../../src/models/filemeta.model';

vi.mock('../../../src/file-meta');
vi.mock('../../src/models/filemeta.model');

describe('connectUniversalDatabase', () => {
  it('should call createFileMetaModel with the correct databaseUrl', async() => {
    const databaseUrl = 'test-database-url';
    await connectUniversalDatabase(databaseUrl);
    expect(createFileMetaModel).toHaveBeenCalledWith(databaseUrl);
  });
});
