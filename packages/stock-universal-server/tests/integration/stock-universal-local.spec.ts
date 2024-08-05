import { describe, expect, it, vi } from 'vitest';
import { createFileMetaModel } from '../../src/models/filemeta.model';
import { connectUniversalDatabase } from '../../src/stock-universal-local';

vi.mock('../../../src/file-meta');
vi.mock('../../src/models/filemeta.model');

describe('connectUniversalDatabase', () => {
  it('should call createFileMetaModel with the correct databaseUrl', async() => {
    const databaseUrl = 'test-database-url';

    await connectUniversalDatabase(databaseUrl);
    expect(createFileMetaModel).toHaveBeenCalledWith(databaseUrl);
  });
});
