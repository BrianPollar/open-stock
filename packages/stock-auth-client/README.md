# @open-stock/stock-auth-client

A simple and powerfull authentication library for Javascript on browser with user state management.
This only works with (https://github.com/BrianPollar/@open-stock/stock-auth-server) the server library.

## Features

stock-auth-client implements a full authentication system. It consists of:

- a Javascript client library (this repository)
- a [Node Js Server](https://github.com/BrianPollar/@open-stock/stock-auth-server) for Node.js.

Its main features are:

#### Reliability

The libarary uses standard encryption for data protection:

#### Simple and convenient API

Sample code:

```ts
import { StockAuthClient } from "@open-stock/stock-auth-client";
import Axios from "axios-observable";

// then create an instance
const instance = Axios.create({
  baseURL: "https://yourapi.com",
  timeout: 1000,
  headers: {
    "X-Custom-Header": "foobar",
    Authorization: "auth-token",
  },
});

const authClient = new StockAuthClient(instance);
```

## Installation

```bash
// with npm
npm install @open-stock/stock-auth-client

// with yarn
yarn add @open-stock/stock-auth-client
```

## How to use

The following example gets instance from stock-auth-client.

```js
import { StockAuthClient } from "@open-stock/stock-auth-client";
import Axios from "axios-observable";

// then create an instance
const instance = Axios.create({
  baseURL: "https://yourapi.com",
  timeout: 1000,
  headers: {
    "X-Custom-Header": "foobar",
    Authorization: "auth-token",
  },
});

const authClient = new StockAuthClient(instance);
```

## Extra Features
Here are the features of the stock-auth-client library

## NOTE
Most of the features below are automatically implememnted by the library. But If you want to use the classes and functions provided by the library, you can do so by importing them from the library.
Some of them are elaborated below.

## resolveUserUrId
resolveUserUrId is a function that is used to get the user id from the user object

# usage
  ```ts
import { resolveUserUrId } from "@open-stock/stock-auth-client";

const id = resolveUserUrId(user);
  ```

## resolveUserName
resolveUserName is a function that is used to get the user name from the user object

# usage
  ```ts
import { resolveUserName } from "@open-stock/stock-auth-client";

const name = resolveUserName(user);
  ```

## AuthController
AuthController is a class that is used to manage the authentication of the user. It is used by the StockAuthClient to manage the authentication of the user

# usage
  ```ts
import { AuthController } from "@open-stock/stock-auth-client";

const authController = new AuthController();

// remember users
const res = await authController.authenticateJwt();

// login users
const url = '/loginurl';
const emailPhone = 'email@mail.com' || '033333333333';
const password = 'password';
const res = await authController.login({
  url, emailPhone, password
});

// signup users
const emailPhone = 'email@mail.com' || '033333333333';
const password = 'password';
const firstName = 'firstName';
const lastName = 'lastName';
const res = await authController.signup({
  emailPhone, password, firstName, lastName
});

// rrecover user account
const emailPhone = 'email@mail.com' || '033333333333';
const res = await authController.recover({
  emailPhone
});
const emailPhone = 'email@mail.com' || '033333333333';

// confirm user account
const emailPhone = 'email@mail.com' || '033333333333';
const route = '/recoverurl';
const password = 'password';
const newPassword = 'newPassword';
const res = await authController.confirm({
  userInfo: {
    emailPhone,
    password,
    newPassword,
    token
  },
  route
  }
});

// sociallogin
const emailPhone = 'email@mail.com' || '033333333333';
const password = 'password';
const firstName = 'firstName';
const lastName = 'lastName';

const res = await authController.socialLogin({
  emailPhone, password, firstName, lastName
});
  ```

## Company Definition
Company Definition is a class that is used to define the company. It is used by the StockAuthClient to define the company

# usage
  ```ts
import { Company } from "@open-stock/stock-auth-client";

const company = new Company();
// from here you check the definition of the company for all methods
  ```

## User
User is a class that is used to define the user. It is used by the StockAuthClient to define the user

# usage
  ```ts
import { User } from "@open-stock/stock-auth-client";

const user = new User();
// from here you check the definition of the user for all methods
  ```

## Documentation

The source code of the website can be found [here](https://github.com/BrianPollar/@open-stock/stock-auth-client). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

[MIT](LICENSE)
