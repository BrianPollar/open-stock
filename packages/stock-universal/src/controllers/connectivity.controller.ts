import { Observable, Subject, fromEvent, merge, of } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { LoggerController } from './logger.controller';
import { WindowController } from './window.controller';

/**
 * Represents a controller for managing connectivity.
 */
export class ConnectivityController {
  destroyed$ = new Subject();
  logger = new LoggerController();
  online$: Observable<boolean>;

  constructor(public windowCtrl: WindowController) {}

  /**
   * Starts listening for online/offline events and updates the `online$` observable accordingly.
   */
  startListening() {
    this.logger.debug('ConnectivityService:startListening');
    this.online$ = merge(
      of(navigator.onLine),
      fromEvent(document, 'online').pipe(map(() => true)),
      fromEvent(document, 'offline').pipe(map(() => false))
    ).pipe(takeUntil(this.destroyed$));
  }

  /**
   * Destroys the connectivity controller by unsubscribing from all observables.
   */
  destroy() {
    this.destroyed$.next(true);
  }
}
