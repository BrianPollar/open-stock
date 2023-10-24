"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHostname = void 0;
const tslib_1 = require("tslib");
// This function imports the `os` module.
const os = tslib_1.__importStar(require("os"));
// This function exports a function that gets the hostname.
//
// **Parameters:**
//
// * `req`: The request object.
//
// **Returns:**
//
// The hostname of the server.
/** */
const getHostname = (req) => (req ? req.hostname : os.hostname());
exports.getHostname = getHostname;
// **Comments:**
//
// * The `os` module provides access to the operating system.
// * The `hostname()` method returns the hostname of the server.
// * If the `req` parameter is not provided, then the `os.hostname()` method is used to get the hostname.
// * Otherwise, the `hostname` property of the `req` object is used to get the hostname.
//# sourceMappingURL=gethost.constant.js.map