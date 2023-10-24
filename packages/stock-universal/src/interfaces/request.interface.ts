import { Request } from 'express';
import { Iauthtoken } from './auth.interface';

// This file imports the `Request` class from the `express` library.
// This file imports the `Iauthtoken` interface from the `auth.interface` file.

/** */
export interface Icustomrequest
    extends Request {
    user: Iauthtoken;
}

// This interface extends the `Request` interface and adds a property called `user`.
// The `user` property is an object that contains the user's authentication token.
