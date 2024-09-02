# @open-stock/stock-auth-server

A simple and powerfull authentication library for Nodejs with user state management.
This only works with (https://github.com/BrianPollar/@open-stock/stock-auth-client) the server library.
This requires @open-stock/stock-notif-server and
@open-stock/stock-universal-server to be installed and initialised.

## Features

stock-auth-server implements a full authentication system. It consists of:

- a Node Js Server library (this repository)
- a [JavaScript library](https://github.com/BrianPollar/@open-stock/stock-auth-client) for Node.js.

Its main features are:

#### Reliability

The libarary uses standard encryption for data protection:

#### Simple and convenient API

Sample code:

```ts
import expresss from 'expresss';
import { runStockAuthServer, IStockAuthServerConfig } from "@open-stock/stock-auth-server";

const app = expresss;

const config : IStockAuthServerConfig {
  // ...config
}
const { stockAuthRouter } = await runStockAuthServer(config);

app.use(stockAuthRouter);
```

## Installation

```bash
// with npm
npm install @open-stock/stock-auth-server

// with yarn
yarn add @open-stock/stock-auth-server
```

## How to use

The following example initialises stock-auth-client and gets the chat client and chat controller instances.

```js
import expresss from 'expresss';
import { runStockAuthServer, IStockAuthServerConfig } from "@open-stock/stock-auth-server";

const app = expresss;

const config : IStockAuthServerConfig {
  // ...config
}
const { stockAuthRouter } = await runStockAuthServer(config);

app.use(stockAuthRouter);
```

## Extra Features

Here are the features of the stock-auth-server library

## NOTE

Most of the features below are automatically implememnted by the library. But If you want to use the classes and functions provided by the library, you can do so by importing them from the library.
Some of them are elaborated below.

## defineAdmin

defineAdmin is a function that is used to define an admin.

# usage

```ts
import { defineAdmin } from "@open-stock/stock-auth-server";
const adminProps = defineAdmin();
```

## login

login is a function that is used to login a admin.

# usage

```ts
import { login } from "@open-stock/stock-auth-server";

const res = await login(password, serverKey);
```

## checkIfAdmin

checkIfAdmin is a function that is used to check if a user is an admin.

# usage

```ts
import { checkIfAdmin } from "@open-stock/stock-auth-server";
const emailPhone = "email@mail.com" || "1234567890";
const password = "password";
const recorgnisewdServerId = "serverId";
const serverKey = "serverKey";

const res = await checkIfAdmin(
  emailPhone,
  password,
  recorgnisewdServerId,
  serverKey
);
```

## checkIpAndAttempt

checkIpAndAttempt is a middleware function that is used to check the ip and attempt.

# usage

```ts
import { checkIpAndAttempt } from "@open-stock/stock-auth-server";
import { apiRouter } from "@open-stock/stock-universal-server";

apiRouter.post('/login', checkIpAndAttempt(), (req, res) => {}));
```

## isTooCommonPhrase

isTooCommonPhrase is a middleware function that is used to check if a phrase is too common.

# usage

```ts
import { isTooCommonPhrase } from "@open-stock/stock-auth-server";
import { apiRouter } from "@open-stock/stock-universal-server";

apiRouter.post('/signup', isTooCommonPhrase(), (req, res) => {}));
```

## isInAdictionaryOnline

isInAdictionaryOnline is a middleware function that is used to check if a phrase is in a dictionary online.

# usage

```ts
import { isInAdictionaryOnline } from "@open-stock/stock-auth-server";
import { apiRouter } from "@open-stock/stock-universal-server";

apiRouter.post('/signup', isInAdictionaryOnline(), (req, res) => {}));
```

## generateToken

generateToken is a function that is used to generate a jwt token.

# usage

```ts
import { generateToken } from "@open-stock/stock-auth-server";
import { Iauthtoken } from "@open-stock/stock-universal";

const authConfig: Iauthtoken = {
  // ...
};
const expiryDate = new Date();
const jwtSecret = "string";

const token = generateToken(authConfig, expiryDate, jwtSecret);
```

## setUserInfo

setUserInfo is a function that is used to set the user info.

# usage

```ts
import { setUserInfo } from "@open-stock/stock-auth-server";

const userId: "string";
const permissions: Iuserperm = {
  // ...
};
const companyId: "string";
const companyPermissions: IcompanyPerm = {
  // ...
};

const details = setUserInfo(userId, permissions, companyId, companyPermissions);
```

## companyAuthRoutes

companyAuthRoutes is a function that is used to get the company auth routes.

# usage

```ts
import { companyAuthRoutes } from "@open-stock/stock-auth-server";
import { express } from "express";
const app = express();
app.use("/company", companyAuthRoutes());

// see all routes in the file the router is defined in
```

## authRoutes

authRoutes is a function that is used to get the auth routes.

# usage

```ts
import { authRoutes } from "@open-stock/stock-auth-server";
import { express } from "express";
const app = express();
app.use("/userauth", companyAuthRoutes());
```

## Documentation

The source code of the website can be found [here](https://github.com/BrianPollar/@open-stock/stock-auth-server). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

[MIT](LICENSE)
