/* eslint-disable @typescript-eslint/naming-convention */
import Axios from 'axios-observable';
import { beforeEach, describe, expect, it } from 'vitest';
import { EhttpController } from '../../../../stock-universal/src/controllers/ehttp.controller';

describe('EhttpController', () => {
  let instance: EhttpController;
  const axiosInstance = Axios.create({
    baseURL: 'https://yourapi.com',
    timeout: 1000,
    headers: {

      'X-Custom-Header': 'foobar',

      Authorization: 'auth-token'
    }
  });

  beforeEach(() => {
    instance = new EhttpController(axiosInstance);
  });

  it('#axiosInstance should be an instance of Axios', () => {
    expect(axiosInstance).toBeInstanceOf(Axios);
  });

  it('#instance should be an instance of EhttpController', () => {
    expect(instance).toBeInstanceOf(EhttpController);
  });

  it('should be able to create a new instance of EhttpController', () => {
    const controller = EhttpController.create('https://example.com', 'token');

    expect(controller).toBeInstanceOf(EhttpController);
  });

  it('should be able to append a token to the headers', () => {
    const controller = EhttpController.create('https://example.com', 'token');

    controller.appendToken('new-token');
    expect(controller.axiosInstance.defaults.headers.common['Authorization']).toEqual('new-token');
  });

  it('should be able to append headers to the Axios instance', () => {
    const headers = {
      'X-Custom-Header': 'foobar',
      'Another-Header': 'baz'
    };
    const controller = EhttpController.create('https://example.com', 'token');

    controller.appendHeaders(headers);
    expect(controller.axiosInstance.defaults.headers).toEqual(headers);
  });

  it('should be able to make a GET request', () => {
    const controller = EhttpController.create('https://example.com', 'token');
    const observable = controller.makeGet('/api/users');

    expect(observable).toBeDefined();
  });

  it('should be able to make a PUT request', () => {
    const controller = EhttpController.create('https://example.com', 'token');
    const observable = controller.makePut<Isuccess>('/api/users/1', {
      name: 'John Doe'
    });

    expect(observable).toBeDefined();
  });

  it('should be able to make a POST request', () => {
    const controller = EhttpController.create('https://example.com', 'token');
    const observable = controller.makePost<Isuccess>('/api/users', {
      name: 'John Doe'
    });

    expect(observable).toBeDefined();
  });

  it('should be able to make a DELETE request', () => {
    const controller = EhttpController.create('https://example.com', 'token');
    const observable = controller.makeDelete<Isuccess>('/api/users/1');

    expect(observable).toBeDefined();
  });

  it('should be able to upload files', () => {
    const controller = EhttpController.create('https://example.com', 'token');
    const files = [
      {
        fieldname: 'photos',
        filename: 'file1.png',
        blob: new Blob(['some data'], { type: 'image/png' })
      },
      {
        fieldname: 'photos',
        filename: 'file2.txt',
        blob: new Blob(['some text'], { type: 'text/plain' })
      }
    ];
    const observable = controller.uploadFiles(files, '/api/files');

    expect(observable).toBeDefined();
  });
});

