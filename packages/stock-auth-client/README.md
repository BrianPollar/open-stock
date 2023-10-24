# stock-auth-client

A simple and powerfull authentication library for Javascript on browser with user state management.
This only works with (https://github.com/BrianPollar/stock-auth-server) the server library.

## Features

stock-auth-client implements a full authentication system. It consists of:

- a Javascript client library (this repository)
- a [Node Js Server](https://github.com/BrianPollar/stock-auth-server) for Node.js.

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
npm install stock-auth-client

// with yarn
yarn add stock-auth-client
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

## Documentation

The source code of the website can be found [here](https://github.com/BrianPollar/stock-auth-client). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

[MIT](LICENSE)
