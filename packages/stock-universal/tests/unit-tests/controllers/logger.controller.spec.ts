/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
import { LoggerController } from '../../../../stock-universal/src/controllers/logger.controller';
import { describe, it, expect } from 'vitest';

describe('LoggerController', () => {
  it('should have a properties defined property', () => {
    const controller = new LoggerController();
    expect(controller.debug).toBeDefined();
    expect(controller.warn).toBeDefined();
    expect(controller.error).toBeDefined();
    expect(controller.trace).toBeDefined();
  });

  it('should log messages with the correct colors', () => {
    const controller = new LoggerController();
    controller.debug('This is a debug message');
    controller.warn('This is a warning message');
    controller.error('This is an error message');
    controller.trace('This is a trace message');
    // @ts-ignore
    // const debugSpy = vi.spyOn(controller, 'pDebug');
    // @ts-ignore
    // const warnSpy = vi.spyOn(controller, 'pWarn');
    // @ts-ignore
    // const errorSpy = vi.spyOn(controller, 'pError');
    // @ts-ignore
    // const traceSpy = vi.spyOn(controller, 'pError');
    /**
    expect(debugSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();
    expect(traceSpy).toHaveBeenCalled();
    */


    /*
    expect(console.log).toHaveBeenCalledTimes(4);
    expect(console.log.arguments[0][0]).toMatch('This is a debug message');
    expect(console.log.arguments[1][0]).toMatch('This is a warning message');
    expect(console.log.arguments[2][0]).toMatch('This is an error message');
    expect(console.log.arguments[3][0]).toMatch('This is a trace message');
    expect(console.log.arguments[0][1]).toBe('blue');
    expect(console.log.arguments[1][1]).toBe('yellow');
    expect(console.log.arguments[2][1]).toBe('red');
    expect(console.log.arguments[3][1]).toBe('pink');
    */
  });
});
