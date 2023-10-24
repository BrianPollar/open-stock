// This function imports the `os` module.
import * as os from 'os';

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
export const getHostname = (req?) => (req ? req.hostname : os.hostname());

// **Comments:**
//
// * The `os` module provides access to the operating system.
// * The `hostname()` method returns the hostname of the server.
// * If the `req` parameter is not provided, then the `os.hostname()` method is used to get the hostname.
// * Otherwise, the `hostname` property of the `req` object is used to get the hostname.
