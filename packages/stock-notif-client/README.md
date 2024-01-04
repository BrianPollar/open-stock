# @open-stock/stock-notif-client

A simple notification library for Javascript on browser with user state management.
This only works with (https://github.com/BrianPollar/@open-stock/stock-notif-server) the server library.

## Features

stock-notif-client implements a full notifentication system. It consists of:

- a Javascript client library (this repository)
- a [Node Js Server](https://github.com/BrianPollar/@open-stock/stock-notif-server) for Node.js.

Its main features are:

#### Reliability

The libarary uses standard encryption for data protection:

#### Simple and convenient API

Sample code:

```ts
import { StockNotifClient } from "@open-stock/stock-notif-client";
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
npm install @open-stock/stock-notif-client

// with yarn
yarn add @open-stock/stock-notif-client
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

## Extra Features
Some of the features of @open-stock/stock-notif-client are:

## NOTE
Most of the features below are automatically implememnted by the library. But If you want to use the classes and functions provided by the library, you can do so by importing them from the library.
Some of them are elaborated below.

## Notification Abstraction and Definition
Notification Abstraction and Definition is a class that is used to define the notification and abstract the notification. It is used by the StockNotifClient to define the notification and abstract the notification

# usage
  ```ts
import { NotificationMain, NotifSetting } from "@open-stock/stock-notif-client";

// initialize the NotificationMain
const notificationMain = new NotificationMain();

// initialize the NotifSetting
const notifSetting = new NotifSetting();
```

## Documentation

The source code of the website can be found [here](https://github.com/BrianPollar/@open-stock/stock-notif-client). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

[MIT](LICENSE)
