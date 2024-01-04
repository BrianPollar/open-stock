import { expect, describe, it } from 'vitest';
import { createDirectories, checkDirectoryExists } from '../../../../stock-universal-server/src/filemanager/filemanager.controller';

describe('filemanager', () => {
  const absolutepath = process.cwd();
  const dirs = [
    'hello-world'
  ];

  it('should create directories provided', async() => {
    expect(await createDirectories('testAppFile', absolutepath, dirs)).toBe(true);
  });

  it('should confirm directory exist', async() => {
    expect(await checkDirectoryExists(absolutepath, 'hello-world')).toBe('exists');
  });
});


describe('createDirectories', () => {
  it('should create directories if they do not exist', async() => {
    const appName = 'my-app';
    const absolutepath = '/tmp/my-app';
    const directories = ['uploads', 'logs'];
    const result = await createDirectories(appName, absolutepath, directories);
    expect(result).toBe(true);
  });
});

describe('checkDirectoryExists', () => {
  it('should return `created` if the directory does not exist and is created', async() => {
    const absolutepath = '/tmp/my-app';
    const dir = 'uploads';
    const result = await checkDirectoryExists(absolutepath, dir);
    expect(result).toBe('created');
  });
});
