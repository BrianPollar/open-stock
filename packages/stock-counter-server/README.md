# stock-counter-server

A robust inventory management library for Nodejs with user state management.
This only works with (https://github.com/BrianPollar/stock-counter-client) the server library.

## Features

stock-counter-server implements a full counterentication system. It consists of:

- a Node Js Server library (this repository)
- a [JavaScript library](https://github.com/BrianPollar/stock-counter-client) for Node.js.

Its main features are:

#### Reliability

The libarary uses standard encryption for data protection:

#### Simple and convenient API

Sample code:

```ts
import {
  runStockCounterServer,
  IstockcounterServerConfig,
} from "@open-stock/stock-counter-server";
import express from "express";

const app = express();

const config: IstockcounterServerConfig {
  // ...config
}
app.use(runStockCounterServer(config, app));

```

## Installation

```bash
// with npm
npm install stock-counter-server

// with yarn
yarn add stock-counter-server
```

## How to use

The following example initialises stock-counter-client and gets the chat client and chat controller instances.

```ts
import {
  runStockCounterServer,
  IstockcounterServerConfig,
} from "@open-stock/stock-counter-server";
import express from "express";

const app = express();

const config: IstockcounterServerConfig {
  // ...config
}
app.use(runStockCounterServer(config, app));
```

## Documentation

The source code of the website can be found [here](https://github.com/BrianPollar/stock-counter-server). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

[MIT](LICENSE)
