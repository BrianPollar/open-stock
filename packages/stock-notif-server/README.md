# @open-stock/stock-notif-server

A simple notification library for Nodejs with user state management.
This only works with (https://github.com/BrianPollar/@open-stock/stock-notif-client) the server library.

This library only works when @open-stock/stock-universal-server is initialised.

## Features

@open-stock/stock-notif-server implements a full notifentication system. It consists of:

- a Node Js Server library (this repository)
- a [JavaScript library](https://github.com/BrianPollar/@open-stock/stock-notif-client) for Node.js.

Its main features are:

#### Reliability

The libarary uses standard encryption for data protection:

#### Simple and convenient API

Sample code:

```ts
import {
  runStockNotificationServer,
  IstockNotifServerConfig
} from "@open-stock/stock-notif-server";
import express from "express";

const app = express();

const config: IstockNotifServerConfig = {
  // ...
}
const { stockNotifRouter } = await runStockNotificationServer(config);

app.use(stockNotifRouter);
```

## Installation

```bash
// with npm
npm install @open-stock/stock-notif-server

// with yarn
yarn add @open-stock/stock-notif-server
```

## How to use

The following example initialises stock-notif-client and gets the chat client and chat controller instances.

```js
import {
  runStockNotificationServer,
  ItwilioAuthySecrets,
} from "@open-stock/stock-notif-server";
import express from "express";

const app = express();
const config: IstockNotifServerConfig = {
  // ...
}
const { stockNotifRouter } = await runStockNotificationServer(config);

app.use(stockNotifRouter);
```

## Extra Features
Here are some of the features of stock-notif-server:

## NOTE
Most of the features below are automatically implememnted by the library. But If you want to use the classes and functions provided by the library, you can do so by importing them from the library.
Some of them are elaborated below.

## determineUserHasMail
determineUserHasMail is a function that is used to determine if a user has mail.

# usage
  ```ts
import { determineUserHasMail } from "@open-stock/stock-notif-server";

const userHasMail = determineUserHasMail(user);
  ```

## createSettings
createSettings is a function that is used to create notification settings.

# usage
  ```ts
import { createSettings } from "@open-stock/stock-notif-server";

const settings = await createSettings();
  ```

## setUpUser
setUpUser is a function that is used to set up a user.

# usage
  ```ts
import { setUpUser } from "@open-stock/stock-notif-server";

const phoneNumber = '03333333333'
const countryCode = '1'

const res = await setUpUser(phoneNumber, countryCode);
  ```

## sendToken
sendToken is a function that is used to send a token.

# usage
  ```ts
import { sendToken } from "@open-stock/stock-notif-server";

const authyId = 'authyId'
const res = await sendToken(authyId);
  ```

## sendSms
sendSms is a function that is used to send a sms.

# usage
  ```ts
import { sendSms } from "@open-stock/stock-notif-server";

const phoneNumber = '03333333333';
const countryCode = '1';
const message = 'message';

const res = await sendSms(phoneNumber, countryCode, message);
  ```

## verifyAuthyToken
verifyAuthyToken is a function that is used to verify an authy token.

# usage
  ```ts
import { verifyAuthyToken } from "@open-stock/stock-notif-server";

const authyId = 'authyId';
const token = '1234'; // one time otp

const res = await verifyAuthyToken(authyId, token);
  ```

## constructMail
constructMail is a function that is used to construct a mail.

# usage
  ```ts
import { constructMail } from "@open-stock/stock-notif-server";


const mailObj = constructMail(from,
    to,
    subject,
    text,
    html;
  ```

## sendMail
sendMail is a function that is used to send a mail.

# usage
  ```ts
import { sendMail } from "@open-stock/stock-notif-server";

const res = await sendMail(mailObj);
  ```

## constructMailService
constructMailService is a function that is used to construct a mail service.

# usage
  ```ts
import { constructMailService } from "@open-stock/stock-notif-server";

const settings = {}

const res = await constructMailService(settings);
  ```

## createNotifSetting
createNotifSetting is a function that is used to create a notification setting.

# usage
  ```ts
import { createNotifSetting } from "@open-stock/stock-notif-server";

const setting = {};
const res = await createNotifSetting();
  ```

## createPayload
createPayload is a function that is used to create a payload.

# usage
  ```ts
import { createPayload } from "@open-stock/stock-notif-server";
import { Iactionwithall } from '@open-stock/stock-universal';


  const title = 'string';
  const body: 'string';
  const icon: 'string';
  const actions: Iactionwithall[] = []

const payload = createPayload(title,
body,
icon,
actions);
  ```

## updateNotifnViewed
updateNotifnViewed is a function that is used to update a notification as viewed.

# usage
  ```ts
import { updateNotifnViewed } from "@open-stock/stock-notif-server";
import { Iauthtoken } from '@open-stock/stock-universal';

const user: Iauthtoken = {
  ...
};

const id = 'string';

const updated = await updateNotifnViewed(user, id);
  ```

## makeNotfnBody
makeNotfnBody is a function that is used to make a notification body.

# usage
  ```ts
import { makeNotfnBody } from "@open-stock/stock-notif-server";
import { TnotifType, Iactionwithall } from '@open-stock/stock-universal';

  const userId = 'string';
  const title = 'string';
  const body = 'string';
  const notifType = TnotifType = '';
  const actions = Iactionwithall[] = [];
  const notifInvokerId = 'string';

const notfnBody = makeNotfnBody(userId,
  title,
  body,
  notifType,
  actions,
  notifInvokerId),
  ```


## Documentation

The source code of the website can be found [here](https://github.com/BrianPollar/@open-stock/stock-notif-server). Contributions are welcome!

## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site.

## License

[MIT](LICENSE)
