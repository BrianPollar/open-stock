import { Observable, Subject } from 'rxjs';
import { LoggerController } from './logger.controller';
import { WindowController } from './window.controller';
/**
 * Represents a controller for managing connectivity.
 */
export declare class ConnectivityController {
    windowCtrl: WindowController;
    destroyed$: Subject<unknown>;
    logger: LoggerController;
    online$: Observable<boolean>;
    constructor(windowCtrl: WindowController);
    /**
     * Starts listening for online/offline events and updates the `online$` observable accordingly.
     */
    startListening(): void;
    /**
     * Destroys the connectivity controller by unsubscribing from all observables.
     */
    destroy(): void;
}
