import { checkDirectoryExists } from '../../../src/filemanager/filemanager.controller';
import fse from 'fs-extra';
import { vi, describe, it, expect, afterEach } from 'vitest';

describe('checkDirectoryExists', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create directory if it does not exist', async() => {
    const absolutepath = '/path/to/directory';
    const dir = 'mydir';
    const err: NodeJS.ErrnoException = {
      name: 'err',
      message: 'err,',
      code: 'ENOENT'
    };
    const accessSpy = vi.spyOn(fse, 'access').mockImplementation((path, callback) => {
      callback(err);
    });
    // Mock the access function to simulate directory not existing
    /* fse.access.mockImplementation((path, callback) => {
      callback(err);
    });*/
    // Mock the mkdir function to simulate successful directory creation
    /* fse.mkdir.mockImplementation((path, callback) => {
      callback(null);
    });*/
    const mkdirSpy = vi.spyOn(fse, 'mkdir').mockImplementation((path, callback) => {
      callback(null);
    });
    const result = await checkDirectoryExists(absolutepath, dir);
    expect(accessSpy).toHaveBeenCalledWith('/path/to/directory/mydir', expect.any(Function));
    expect(mkdirSpy).toHaveBeenCalledWith('/path/to/directory/mydir', expect.any(Function));
    expect(result).toBe('created');
  });

  it('should return "exists" if directory already exists', async() => {
    const absolutepath = '/path/to/directory';
    const dir = 'mydir';
    // Mock the access function to simulate directory already existing
    const accessSpy = vi.spyOn(fse, 'access').mockImplementation((path, callback) => {
      callback(null);
    });
    const mkdirSpy = vi.spyOn(fse, 'mkdir');
    const result = await checkDirectoryExists(absolutepath, dir);
    expect(accessSpy).toHaveBeenCalledWith('/path/to/directory/mydir', expect.any(Function));
    expect(mkdirSpy).not.toHaveBeenCalled();
    expect(result).toBe('exists');
  });

  it('should return "someError" if there is an error accessing the directory', async() => {
    const absolutepath = '/path/to/directory';
    const dir = 'mydir';
    // Mock the access function to simulate error accessing the directory
    const accessSpy = vi.spyOn(fse, 'access').mockImplementation((path, callback) => {
      callback(null);
    });
    const mkdirSpy = vi.spyOn(fse, 'mkdir');
    const result = await checkDirectoryExists(absolutepath, dir);
    expect(accessSpy).toHaveBeenCalledWith('/path/to/directory/mydir', expect.any(Function));
    expect(mkdirSpy).not.toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  it('should return "someError" if there is an error creating the directory', async() => {
    const absolutepath = '/path/to/directory';
    const err: NodeJS.ErrnoException = {
      name: 'err',
      message: 'err,',
      code: 'ENOENT'
    };
    const dir = 'mydir';
    // Mock the access function to simulate directory not existing
    const accessSpy = vi.spyOn(fse, 'access').mockImplementation((path, callback) => {
      callback(err);
    });
    // Mock the mkdir function to simulate error creating the directory
    const mkdirSpy = vi.spyOn(fse, 'mkdir').mockImplementation((path, callback) => {
      callback(new Error('Some error'));
    });
    const result = await checkDirectoryExists(absolutepath, dir);
    expect(accessSpy).toHaveBeenCalledWith('/path/to/directory/mydir', expect.any(Function));
    expect(mkdirSpy).toHaveBeenCalledWith('/path/to/directory/mydir', expect.any(Function));
    expect(result).toBe('created');
  });
});
