/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
import { describe, expect, it, vi } from 'vitest';
import { LoggerController } from '../../../../stock-universal/src/controllers/logger.controller';

describe('LoggerController', () => {
  it('should have properties defined', () => {
    const controller = new LoggerController();

    expect(controller.debug).toBeDefined();
    expect(controller.warn).toBeDefined();
    expect(controller.error).toBeDefined();
    expect(controller.trace).toBeDefined();
  });

  it('should log messages with the correct colors', () => {
    const controller = new LoggerController();
    const debugSpy = vi.spyOn(controller, 'pDebug');
    const warnSpy = vi.spyOn(controller, 'pWarn');
    const errorSpy = vi.spyOn(controller, 'pError');
    const traceSpy = vi.spyOn(controller, 'pTrace');

    controller.debug('This is a debug message');
    controller.warn('This is a warning message');
    controller.error('This is an error message');
    controller.trace('This is a trace message');
    expect(debugSpy).toHaveBeenCalledWith('This is a debug message');
    expect(warnSpy).toHaveBeenCalledWith('This is a warning message');
    expect(errorSpy).toHaveBeenCalledWith('This is an error message');
    expect(traceSpy).toHaveBeenCalledWith('This is a trace message');
  });
});
