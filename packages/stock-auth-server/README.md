# stock-auth-server

A simple and powerfull authentication library for Nodejs with user state management.
This only works with (https://github.com/BrianPollar/stock-auth-client) the server library.

## Features

stock-auth-server implements a full authentication system. It consists of:

- a Node Js Server library (this repository)
- a [JavaScript library](https://github.com/BrianPollar/stock-auth-client) for Node.js.

Its main features are:

#### Reliability

The libarary uses standard encryption for data protection:

#### Simple and convenient API

Sample code:

```ts
import expresss from 'expresss';
import { runStockAuthServer, IStockAuthServerConfig } from "stock-auth-server";

const app = expresss;

const config : IStockAuthServerConfig {
  // ...config
}
app.use(runStockAuthServer(config, app))

```

## Installation

```bash
// with npm
npm install stock-auth-server

// with yarn
yarn add stock-auth-server
```

## How to use

The following example initialises stock-auth-client and gets the chat client and chat controller instances.

```js
import expresss from 'expresss';
import { runStockAuthServer, IStockAuthServerConfig } from "stock-auth-server";

const app = expresss;

const config : IStockAuthServerConfig {
  // ...config
}
app.use(runStockAuthServer(config, app))
```

## Documentation

The source code of the website can be found [here](https://github.com/BrianPollar/easy-chat-server). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

[MIT](LICENSE)
