import { describe, expect, it } from 'vitest';
import { createPayload } from '../../../src/controllers/notifications.controller';

describe('createPayload', () => {
  it('should create payload with default actions', () => {
    const title = 'Test Title';
    const body = 'Test Body';
    const icon = 'test-icon.png';

    const expectedPayload = {
      notification: {
        title,
        body,
        icon,
        duplicateActions: [
          { action: 'bar', title: 'Focus last' },
          { action: 'baz', title: 'Navigate last' }
        ],
        data: {
          onActionClick: {
            default: { operation: 'openWindow' },
            bar: { operation: 'focusLastFocusedOrOpen', url: '' },
            baz: { operation: 'focusLastFocusedOrOpen', url: '' }
          }
        }
      }
    };
    const payload = createPayload(title, body, icon);
    expect(payload).toEqual(expectedPayload);
  });

  it('should create payload with custom actions', () => {
    const title = 'Test Title';
    const body = 'Test Body';
    const icon = 'test-icon.png';
    const actions = [
      { action: 'foo', title: 'Custom Action 1', operation: 'customOperation1', url: '/custom-url-1' },
      { action: 'bar', title: 'Custom Action 2', operation: 'customOperation2', url: '/custom-url-2' }
    ];

    const expectedPayload = {
      notification: {
        title,
        body,
        icon,
        duplicateActions: [
          { action: 'foo', title: 'Custom Action 1' },
          { action: 'bar', title: 'Custom Action 2' }
        ],
        data: {
          onActionClick: {
            default: { operation: 'openWindow' },
            foo: { operation: 'customOperation1', url: '/custom-url-1' },
            bar: { operation: 'customOperation2', url: '/custom-url-2' }
          }
        }
      }
    };
    const payload = createPayload(title, body, icon, actions);
    expect(payload).toEqual(expectedPayload);
  });
});
