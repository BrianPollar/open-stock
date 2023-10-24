# stock-notif-server

A simple notification library for Nodejs with user state management.
This only works with (https://github.com/BrianPollar/stock-notif-client) the server library.

## Features

stock-notif-server implements a full notifentication system. It consists of:

- a Node Js Server library (this repository)
- a [JavaScript library](https://github.com/BrianPollar/stock-notif-client) for Node.js.

Its main features are:

#### Reliability

The libarary uses standard encryption for data protection:

#### Simple and convenient API

Sample code:

```ts
import {
  runStockNotificationServer,
  IstocknotifServerConfig,
} from "stock-notif-server";
import express from "express";

const app = express();

app.use(runStockNotificationServer(IstocknotifServerConfig, app));
```

## Installation

```bash
// with npm
npm install stock-notif-server

// with yarn
yarn add stock-notif-server
```

## How to use

The following example initialises stock-notif-client and gets the chat client and chat controller instances.

```js
import {
  runStockNotificationServer,
  IstocknotifServerConfig,
} from "stock-notif-server";
import express from "express";

const app = express();

app.use(runStockNotificationServer(IstocknotifServerConfig, app));
```

## Documentation

The source code of the website can be found [here](https://github.com/BrianPollar/stock-notif-server). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

[MIT](LICENSE)
