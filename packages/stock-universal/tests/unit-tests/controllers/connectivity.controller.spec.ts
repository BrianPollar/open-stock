import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConnectivityController } from '../../../src/controllers/connectivity.controller';
import { WindowController } from '../../../src/controllers/window.controller';
import { Subject, takeUntil } from 'rxjs';


describe('ConnectivityController', () => {
  let connectivityController: ConnectivityController;
  const destroyed$ = new Subject();

  beforeEach(() => {
    const windowCtrl = new WindowController(document);
    connectivityController = new ConnectivityController(windowCtrl);
  });

  afterEach(() => {
    destroyed$.next(true);
    connectivityController.destroy();
  });

  it('should start listening for online/offline events', () => {
    connectivityController.startListening();
    expect(connectivityController.online$).toBeDefined();
  });

  it('should emit true when online event is triggered', () => new Promise(done => {
    connectivityController.startListening();
    const onlineEvent = new Event('online');
    window.dispatchEvent(onlineEvent);
    connectivityController.online$
      .pipe(takeUntil(destroyed$))
      .subscribe((isOnline) => {
        expect(isOnline).toBeTruthy();
        done(null);
      });
  }));

  it('should emit the initial online status', () => {
    // vi.spyOn(navigator, 'onLine').mockReturnValue(true);
    connectivityController.startListening();
    connectivityController.online$.subscribe((isOnline) => {
      expect(isOnline).toBeTruthy();
    });
  });

  it('should destroy the controller', () => {
    const destroyed$Spy = vi.spyOn(connectivityController.destroyed$, 'next');
    connectivityController.destroy();
    expect(destroyed$Spy).toHaveBeenCalledWith(true);
  });
});
