# @open-stock/stock-counter-client

A universial inventory management library for Javascript on browser with user state management.
This only works with (https://github.com/BrianPollar/@open-stock/stock-counter-server) the server library.

## Features

stock-cpounter-client implements a full authentication system. It consists of:

- a Javascript client library (this repository)
- a [Node Js Server](https://github.com/BrianPollar/@open-stock/stock-counter-server) for Node.js.

Its main features are:

#### Reliability

The libarary uses standard encryption for data protection:

#### Simple and convenient API

Sample code:

```ts
import { createStockCounter } from "@open-stock/stock-counter-client";
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
npm install @open-stock/stock-counter-client

// with yarn
yarn add @open-stock/stock-counter-client
```

## How to use

The following example gets user from stock-auth-client and gets the chat client and chat controller instances.

```js
import { createStockCounter } from "@open-stock/stock-counter-client";
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

## Extra Features
Here are the features of the stock-counter-client library

## NOTE
Most of the features below are automatically implememnted by the library. But If you want to use the classes and functions provided by the library, you can do so by importing them from the library.
Some of them are elaborated below.

## transformFaqToNameOrImage
transformFaqToNameOrImage is a function that is used to transform a faq to a name or image.

# usage
  
  ```ts
import { transformFaqToNameOrImage } from "@open-stock/stock-counter-client";

const faq: Faq ={
  // ...
};
const type = 'img' || 'name';

const nameOrImage = transformFaqToNameOrImage(faq, type);
  ```

## transformEstimateId
transformEstimateId is a function that is used to transform an estimate id.

# usage
  
  ```ts
import { transformEstimateId } from "@open-stock/stock-counter-client";

const result = transformEstimateId('123');
  ```

## transformInvoice
transformInvoice is a function that is used to transform an invoice.

# usage
  
  ```ts
import { transformInvoice } from "@open-stock/stock-counter-client";

const result = transformInvoice('123');
  ```

## transformUrId
transformUrId is a function that is used to transform a user id.

# usage
  
  ```ts
import { transformUrId } from "@open-stock/stock-counter-client";

const result = transformUrId('123', 'CAR');
  ```

## likeFn
likeFn is a function that is used to like an item.

# usage
  
  ```ts
import { likeFn, Item } from "@open-stock/stock-counter-client";
import { User } from '@open-stock/stock-auth-client';

const currentUser: User = {
  // ...
};
const item: Item = {
  // ...
};

const { success } = await likeFn('companyId', currentUser, item);
  ```

## unLikeFn
unLikeFn is a function that is used to unlike an item.

# usage
  
  ```ts
import { unLikeFn, Item } from "@open-stock/stock-counter-client";
import { User } from '@open-stock/stock-auth-client';

const currentUser: User = {
  // ...
};
const item: Item = {
  // ...
};

const { success } = await unLikeFn('companyId', currentUser, item);
  ```

## determineLikedFn
determineLikedFn is a function that is used to determine if an item is liked.

# usage
  
  ```ts
import { determineLikedFn, Item } from "@open-stock/stock-counter-client";
import { User } from '@open-stock/stock-auth-client';

const currentUser: User = {
  // ...
};
const item: Item = {
  // ...
};

const res = await determineLikedFn(item, currentUser);
  ```

## markInvStatusAsFn
markInvStatusAsFn is a function that is used to change an invoice status.

# usage
  
  ```ts
import { markInvStatusAsFn, Invoice } from "@open-stock/stock-counter-client";
import { TinvoiceStatus } from '@open-stock/stock-universal';

const invoice: Invoice = {
  // ...
};
const status: TinvoiceStatus = 'pending';

const { success } = await markInvStatusAsFn('companyId', invoice, status);
  ```

## deleteInvoiceFn
deleteInvoiceFn is a function that is used to delete an invoice.

# usage
  
  ```ts
import { deleteInvoiceFn, Invoice } from "@open-stock/stock-counter-client";

const invoices: Invoice[] = [
  // ...
];

const { success } = await deleteInvoiceFn('companyId', '_id', invoices);
  ```

## toggleSelectionFn
toggleSelectionFn is a function that is used to toggle selection.

# usage
  
  ```ts
import { toggleSelectionFn } from "@open-stock/stock-counter-client";

const id = '123';
const selections = ['123', '456'];

toggleSelectionFn(id, selections);
  ```

## deleteManyInvoicesFn
deleteManyInvoicesFn is a function that is used to delete many invoices.

# usage
  
  ```ts
import { deleteManyInvoicesFn, Invoice } from "@open-stock/stock-counter-client";

const invoices: Invoice[] = [
  // ...
];
const selections = ['123', '456'];

const { success } = await deleteManyInvoicesFn('companyId', invoices, selections);
  ```

## openBoxFn
openBoxFn is a function that is used to open a box.

# usage

  ```ts
import { openBoxFn } from "@open-stock/stock-counter-client";

const val = '123';
const boxes = ['123', '456'];

openBoxFn(val, boxes);
  ```

## transformNoInvId
transformNoInvId is a function that is used to transform a no invoice id.

# usage
  
  ```ts
import { transformNoInvId } from "@open-stock/stock-counter-client";

const suffix = 'ABC';
const val = 123;

const result = transformNoInvId(suffix, val);
  ```

## applyBlockDateSelect
Applies a block date select filter to the given data array based on the specified condition.

# usage
  
  ```ts
import { applyBlockDateSelect, Estimate } from "@open-stock/stock-counter-client";

const estimates: Estimate[] = [
  // ...
];

const result = applyBlockDateSelect(estimates, 'pending');
  ```

## CalculationsController
CalculationsController is a class that is used to manage calculations. It is used by the StockCounterClient to manage calculations.

# usage
  
  ```ts
import { CalculationsController } from "@open-stock/stock-counter-client";

const calculationsController = new CalculationsController();

// see file definition for all methods descriptions
  ```

## InventoryController
InventoryController is a class that is used to manage inventory. It is used by the StockCounterClient to manage inventory.

# usage
  
  ```ts
import { InventoryController } from "@open-stock/stock-counter-client";

const inventoryController = new InventoryController();

// see file definition for all methods descriptions
  ```

## PaymentController
PaymentController is a class that is used to manage payments. It is used by the StockCounterClient to manage payments.

# usage
  
  ```ts
import { PaymentController } from "@open-stock/stock-counter-client";

const paymentController = new PaymentController();

// see file definition for all methods descriptions
  ```ts
  ```


## Documentation

The source code of the website can be found [here](https://github.com/BrianPollar/@open-stock/stock-counter-client). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

[MIT](LICENSE)
