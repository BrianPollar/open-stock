# @open-stock/stock-universal

A exposes universal functionality to all othet @open-stock libraries.
This is the first library you initialise incase you want to use the rest of othe @open-stock libraries

#### A bunch of helper functions

Sample code:

```ts
import {
  EhttpController,
  StockUniversal,
  IenvironmentConfig,
} from "@open-stock/stock-universal";

const environment: IenvironmentConfig = {};

// then run it as follows
const universal = new StockUniversal(environment);
```

## Installation

```bash
// with npm
npm install @open-stock/stock-universal

// with yarn
yarn add @open-stock/stock-universal
```

## How to use

```ts
import {
  EhttpController,
  StockUniversal,
  IenvironmentConfig,
} from "@open-stock/stock-universal";

const environment: IenvironmentConfig = {};

// then run it as follows
const universal = new StockUniversal(environment);
```

## Extra Features
The following are the features of the stock-universal library

## NOTE
Most of the features below are automatically implememnted by the library. But If you want to use the classes and functions provided by the library, you can do so by importing them from the library.
Some of them are elaborated below.

## WindowController
WindowController is a class that is used to check if the device is connected to the internet or not. It is used by the EhttpController to check if the device is connected to the internet before making a request

# use it as below
  
  ```ts
  import { WindowController } from "@open-stock/stock-universal";

  const doc = document;
  const windowController = new WindowController(doc);

  // get window
  const window = windowController.getWindow();

  // get location
  const location = windowController.getLocation();

  // create Element
  const tag = "div";
  const element = windowController.createElement(tag);
  
  ```

## ConnectivityController
connectivityController is a class that is used to check if the device is connected to the internet or not. It is used by the EhttpController to check if the device is connected to the internet before making a request

# use it as below
  
  ```ts
  import { ConnectivityController, WindowController } from "@open-stock/stock-universal";

  const connectivityController = new ConnectivityController(new WindowController(document));

  // listen to offline, online connections
  connectivityController.startListening();

  // subscribe to changes as follows
  const subscription = connectivityController.online$.subscribe((isConnected) => {
    // do something with the connection
  });

  // TO CLEAN UP
  subscription.unsubscribe();
  
  // while destroying application, rather tha a component, you can call this
  connectivityController.destroy();
  ```

## EhttpController
EhttpController is a class that is used to make http requests. It is used by the EhttpController to check if the device is connected to the internet before making a request

# usage
```ts
import { EhttpController } from "@open-stock/stock-universal";
import { Axios } from 'axios-observable';
import { lastValueFrom } from 'rxjs';
import { Ifile } from '@open-stock/stock-universal';

const axiosInstance = Axios.create({
  baseURL: "https://jsonplaceholder.typicode.com", // your url
  timeout: 1000,
});


const ehttpController = new EhttpController(axiosInstance);

// alternatively there is a static method that can be used to create an instance
const ehttpController = EhttpController.create({
  baseURL: "https://jsonplaceholder.typicode.com", // your url
  timeout: 1000,
});


// append token
ehttpController.appendToken("token");

// append headers
ehttpController.appendHeaders({});

// get request
const observer$ = ehttpController.makeGet('/url');
const response = await lastValueFrom(observer$);

// put request
const observer$ = ehttpController.makePut('/url', body);
const response = await lastValueFrom(observer$);

// post request
const observer$ = ehttpController.makePost('/url', body);
const response = await lastValueFrom(observer$);

// delete request
const observer$ = ehttpController.makeDelete('/url');
const response = await lastValueFrom(observer$);

// upload files
const files: Ifile[] = []
const observer$ = ehttpController.uploadFiles(files, '/url', extras);
const response = await lastValueFrom(observer$);

```

## LoggerController
LoggerController is a class that is used to log errors to the console. It is used by the EhttpController to log errors to the console

# usage
```ts
import { LoggerController } from "@open-stock/stock-universal";

const loggerController = new LoggerController();

// debug
loggerController.debug("message");

// warn
loggerController.warn("message");

// error
loggerController.error("message");

//trace
loggerController.trace("message");
```

## emailphoneValidator
emailphoneValidator is a function that is used to validate emails and phone numbers

# usage
```ts
import { emailphoneValidator } from "@open-stock/stock-universal";

const { valid, message } = emailphoneValidator;
```

## validateEmail
emailphoneValidator is a function that is used to validate only emails

# usage
```ts
import { validateEmail } from "@open-stock/stock-universal";

const { valid, message } = validateEmail;
```

## makeRandomString
makeRandomString is a function that is used to generate random strings

# usage
```ts
import { makeRandomString, Tmkrandomstringhow } from "@open-stock/stock-universal";

const length = 10;
const how: Tmkrandomstringhow = 'numbers';

const randomString = makeRandomString(length, how);
```

## validatePasswordMatch
validatePasswordMatch is a function that is used to validate if two passwords match

# usage
```ts
import { validatePasswordMatch } from "@open-stock/stock-universal";

const { valid, message } = validatePasswordMatch;
```

## validatePhone
validatePhone is a function that is used to validate phone numbers

# usage
```ts
import { validatePhone } from "@open-stock/stock-universal";

const { valid, message } = validatePhone;
```

## Documentation

The source code of the website can be found [here](https://github.com/BrianPollar/@open-stock/stock-universal). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

[MIT](LICENSE)
