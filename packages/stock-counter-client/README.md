# stock-counter-client

A universial inventory management library for Javascript on browser with user state management.
This only works with (https://github.com/BrianPollar/stock-counter-server) the server library.

## Features

stock-cpounter-client implements a full authentication system. It consists of:

- a Javascript client library (this repository)
- a [Node Js Server](https://github.com/BrianPollar/stock-counter-server) for Node.js.

Its main features are:

#### Reliability

The libarary uses standard encryption for data protection:

#### Simple and convenient API

Sample code:

```ts
import { createStockCounter } from "easy-counter-client";
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

const { stockCounterClient } = createStockCounter(instance);
```

## Installation

```bash
// with npm
npm install stock-counter-client

// with yarn
yarn add stock-counter-client
```

## How to use

The following example gets user from stock-auth-client and gets the chat client and chat controller instances.

```js
import { createStockCounter } from "easy-counter-client";
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

const { stockCounterClient } = createStockCounter(instance);
```

## Documentation

The source code of the website can be found [here](https://github.com/BrianPollar/stock-counter-client). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

[MIT](LICENSE)
