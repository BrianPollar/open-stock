# @open-stock/stock-univesal-server
A exposes universal functionality to all othet @open-stock libraries on the server side.
This library requires @open-stock/stock-universal to be initialised first.

#### A bunch of helper functions
Sample code:

```ts
import {
  runStockUniversalServer,
  createDirectories,
} from "@open-stock/stock-universal-server";

const databaseConfigUrl = "";
await runStockUniversalServer(databaseConfigUrl);
```

## Installation

```bash
// with npm
npm install @open-stock/stock-universal-server

// with yarn
yarn add @open-stock/stock-universal-server
```

## How to use

```ts
import {
  runStockUniversalServer,
  createDirectories,
} from "@open-stock/stock-universal-server";

const databaseConfigUrl = ""; // must be a mongodb connection string
await runStockUniversalServer(databaseConfigUrl);
```

## Extra Features
The following are the features of the stock-universal library

## NOTE
Most of the features below are automatically implememnted by the library. But If you want to use the classes and functions provided by the library, you can do so by importing them from the library.
Some of them are elaborated below.

## getEnvVar
getEnvVar is a function that is used to get the environment variables from the process.env object. It is used by the EhttpController to get the environment variables

# usage
  ```ts
import { getEnvVar } from "@open-stock/stock-universal-server";

const name = 'name'
const envVar = getEnvVar(name);
  ```

## getExpressLocals
getExpressLocals is a function that is used to get the express locals from the express request object. It is used by the EhttpController to get the express locals

# usage
  ```ts
import { getExpressLocals } from "@open-stock/stock-universal-server";
import express from 'express';
const app = epress();

const localVar = getExpressLocals(app, 'name');
  ```

## apiRouter
apiRouter is a function that is used to get the express router for the api. It is used by the EhttpController to get the express router for the api

# usage
  ```ts
import { apiRouter } from "@open-stock/stock-universal-server";
import express from 'express';
const app = epress();

app.use('/api', apiRouter());
  ```
  
## requireAuth
requireAuth is a function that is used to get the express middleware for the authentication api. It is used by the EhttpController to get the express middleware for the api

# usage
  ```ts
import { requireAuth } from "@open-stock/stock-universal-server";
import express from 'express';
import { authRouter } from './authRouter';

const app = epress();

app.use('/api', requireAuth(), authRouter());
  ```
  
## makeUrId
makeUrId is a function that is used to mkake an id by incrementing the supplie value by 1. 

# usage
  ```ts
import { makeUrId } from "@open-stock/stock-universal-server";

const lastPosition = 11;
const id = makeUrId(lastPosition);
  ```

## getHostname
getHostname is a function that is used to get the running hostname;

# usage
  ```ts
import { getHostname } from "@open-stock/stock-universal-server";
import { apiRouter } from './apiRouter';
import express from 'express';

const app = epress();

app.use('/api', apiRouter());

apiRouter.get('/hostname', (req, res) => {
  const hostname = getHostname(req);
});


// or without request object
const hostname = getHostname();
  ```
  
## stringifyMongooseErr
stringifyMongooseErr is a function that is used to stringify the mongoose error object

# usage
  ```ts
import { stringifyMongooseErr } from "@open-stock/stock-universal-server";

const errString = stringifyMongooseErr(err);
  ```
  
## offsetLimitRelegator
offsetLimitRelegator is a function that is used to get the offset and limit from the request query. 

# usage
  ```ts
import { offsetLimitRelegator } from "@open-stock/stock-universal-server";

const initialOffset = 0;
const initialLimit = 10;

const { initialOffset, initialLimit } = offsetLimitRelegator(req);
  ```
  
## verifyObjectId
verifyObjectId is a function that is used to verify if a string is a valid mongoose object id

# usage
  ```ts
import { verifyObjectId } from "@open-stock/stock-universal-server";

const valid = verifyObjectId(id);
  ```
  
## verifyObjectIds
verifyObjectIds is a function that is used to verify if an array of strings are valid mongoose object ids

# usage
  ```ts
import { verifyObjectIds } from "@open-stock/stock-universal-server";

const valid = verifyObjectIds(ids);
  ```
  
## createDirectories
createDirectories is a function that is used to create directories

# usage
  ```ts
import { createDirectories } from "@open-stock/stock-universal-server";

const appName = 'app';
const absolutepath = '/'; // you might want to get this from process.cwd()
const directories = ['dir1', 'dir2', 'dir3'];

const created = await createDirectories(appName, absolutepath, directories);
  ```
  
## checkDirectoryExists
checkDirectoryExists is a function that is used to check if a directory exists

# usage
  ```ts
import { checkDirectoryExists } from "@open-stock/stock-universal-server";

const absolutepath = '/'; // you might want to get this from process.cwd()
const useAbsolutePath = 'first';

const exists = await checkDirectoryExists(absolutepath, useAbsolutePath, useAbsolutePath);
  ```
  
## uploadFiles
uploadFiles is a middleware function that is used to upload files to a server

# usage
  ```ts
import { uploadFiles } from "@open-stock/stock-universal-server";
  ```
  
## appendBody
appendBody is a middleware function that is used to append the body to the request object after uploadFiles middleware

# usage
  ```ts
import { appendBody } from "@open-stock/stock-universal-server";
  ```
  
## saveMetaToDb
saveMetaToDb is a middleware function that is used to save the meta data to the database after appendBody middleware

# usage
  ```ts
import { saveMetaToDb } from "@open-stock/stock-universal-server";
  ```
  
## updateFiles
updateFiles is a middleware function that is used to update files

# usage
  ```ts
import { updateFiles } from "@open-stock/stock-universal-server";
  ```
  
## deleteFiles
deleteFiles is a middleware function that is used to delete files

# usage
  ```ts
import { deleteFiles } from "@open-stock/stock-universal-server";
  ```
  
## getOneFile
getOneFile is a middleware function that is used to get one file

# usage
  ```ts
import { getOneFile } from "@open-stock/stock-universal-server";
  ```
  
## returnLazyFn
returnLazyFn is a function that is used to return response status 200 okay after all middleware functions have been executed successfully

# usage
  ```ts
import { returnLazyFn } from "@open-stock/stock-universal-server";
  ```

## Documentation

The source code of the website can be found [here](https://github.com/BrianPollar/@open-stock/stock-universal-server). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

[MIT](LICENSE)
