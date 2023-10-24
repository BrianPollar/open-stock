# stock-notif-client

A simple notification library for Javascript on browser with user state management.
This only works with (https://github.com/BrianPollar/stock-notif-server) the server library.

## Features

stock-notif-client implements a full notifentication system. It consists of:

- a Javascript client library (this repository)
- a [Node Js Server](https://github.com/BrianPollar/stock-notif-server) for Node.js.

Its main features are:

#### Reliability

The libarary uses standard encryption for data protection:

#### Simple and convenient API

Sample code:

```ts
import { StockNotifClient } from "stock-notif-client";
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

const newNotifClient = new StockNotifClient(instance);
```

## Installation

```bash
// with npm
npm install stock-notif-client

// with yarn
yarn add stock-notif-client
```

## How to use

The following example gets user from stock-notif-client and gets the chat client and chat controller instances.

```js
import { StockNotifClient } from "stock-notif-client";
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

const newNotifClient = new StockNotifClient(instance);
```

## Documentation

The source code of the website can be found [here](https://github.com/BrianPollar/stock-notif-client). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

[MIT](LICENSE)
