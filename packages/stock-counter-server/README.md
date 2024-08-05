# @open-stock/stock-counter-server

A robust inventory management library for Nodejs with user state management.
This only works with (https://github.com/BrianPollar/@open-stock/stock-counter-client) the server library and (https://github.com/BrianPollar/pesapal3) thhe payment library.

For this to work also @open-stock/stock-auth-server must be installed and initialised.

## Features

stock-counter-server implements a full counterentication system. It consists of:

- a Node Js Server library (this repository)
- a [JavaScript library](https://github.com/BrianPollar/stock-counter-client) for Node.js.

Its main features are:

#### Reliability

The library uses standard encryption for data protection:

#### Simple and convenient API

Sample code:

```ts
import {
  runStockCounterServer,
  IstockcounterServerConfig,
} from "@open-stock/stock-counter-server";
import { PesaPalController } from 'pesapal3';
import express from "express";

const app = express();

const paymentInstance = new PesaPalController()

const config: IstockcounterServerConfig {
  // ...config
}
const { stockCounterRouter } = await runStockCounterServer(config, paymentInstance);

app.use(stockCounterRouter);
```

## Installation

```bash
// with npm
npm install @open-stock/stock-counter-server

// with yarn
yarn add @open-stock/stock-counter-server
```

## How to use

The following example initialises stock-counter-client and gets the chat client and chat controller instances.

```ts
import {
  runStockCounterServer,
  IstockcounterServerConfig,
} from "@open-stock/stock-counter-server";
import { PesaPalController } from 'pesapal3';
import express from "express";

const app = express();

const paymentInstance = new PesaPalController()

const config: IstockcounterServerConfig {
  // ...config
}
const { stockCounterRouter } = await runStockCounterServer(config, paymentInstance);

app.use(stockCounterRouter);
```

## Documentation

## Extra Features

Here are the features of the stock-counter-server library

## NOTE

Most of the features below are automatically implememnted by the library. But If you want to use the classes and functions provided by the library, you can do so by importing them from the library.
Some of them are elaborated below.

## paymentController

paymentController is a function that is used to get the payment controller.

# usage

```ts
import { payOnDelivery } from "@open-stock/stock-counter-server";

// check all the functions implementations in the file containing payOnDelivery for more functionalities to handle payment
```

The source code of the website can be found [here](https://github.com/BrianPollar/stock-counter-server). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

[MIT](LICENSE)
