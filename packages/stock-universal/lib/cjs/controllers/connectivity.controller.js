"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectivityController = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const logger_controller_1 = require("./logger.controller");
/**
 * Represents a controller for managing connectivity.
 */
class ConnectivityController {
    constructor(windowCtrl) {
        this.windowCtrl = windowCtrl;
        this.destroyed$ = new rxjs_1.Subject();
        this.logger = new logger_controller_1.LoggerController();
    }
    /**
     * Starts listening for online/offline events and updates the `online$` observable accordingly.
     */
    startListening() {
        this.logger.debug('ConnectivityService:startListening');
        this.online$ = (0, rxjs_1.merge)((0, rxjs_1.of)(navigator.onLine), (0, rxjs_1.fromEvent)(document, 'online').pipe((0, operators_1.map)(() => true)), (0, rxjs_1.fromEvent)(document, 'offline').pipe((0, operators_1.map)(() => false))).pipe((0, operators_1.takeUntil)(this.destroyed$));
    }
    /**
     * Destroys the connectivity controller by unsubscribing from all observables.
     */
    destroy() {
        this.destroyed$.next(true);
    }
}
exports.ConnectivityController = ConnectivityController;
//# sourceMappingURL=connectivity.controller.js.map