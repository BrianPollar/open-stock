import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WindowController } from '../../../src/controllers/window.controller';

describe('WindowController', () => {
  let windowController: WindowController;

  beforeEach(() => {
    windowController = new WindowController(document);
  });

  it('should return the window object', () => {
    const result = windowController.getWindow();
    expect(result).toBeTruthy();
  });

  it('should return the location object', () => {
    const result = windowController.getLocation();
    expect(result).toBeTruthy();
  });

  it('should create an element with the given tag', () => {
    const tagName = 'div';
    const createElementSpy = vi.spyOn(document, 'createElement');
    const result = windowController.createElement(tagName);
    expect(result).toBeTruthy();
    expect(createElementSpy).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledTimes(1);
    expect(document.createElement).toHaveBeenCalledWith(tagName);
  });
});
