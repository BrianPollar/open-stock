import { TnotifType } from '../types/union.types';

// This file imports the `TnotifType` type from the `union.types` file.

/** */
export interface Iaction {
  // The `action` property is the name of the action.
  action: string;
  // The `title` property is the title of the action.
  title: string;
}

// This interface defines the properties of an action.

/** */
export interface Iactionwithall
  extends Iaction {
  // The `operation` property is the operation that is performed when the action is clicked.
  operation: string;
  // The `url` property is the URL that is opened when the action is clicked.
  url: string;
}

// This interface extends the `Iaction` interface and defines the properties of an action with all the details.

/** */
export interface Imainnotification {
  // The `_id` property is the ID of the notification.
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id?: string;
  // The `actions` property is an array of actions.
  actions: Iactionwithall[];
  // The `userId` property is the ID of the user who received the notification.
  userId: string;
  // The `title` property is the title of the notification.
  title: string;
  // The `body` property is the body of the notification.
  body: string;
  // The `icon` property is the icon of the notification.
  icon: string;
  // The `notifType` property is the type of the notification.
  notifType?: TnotifType;
  // The `notifInvokerId` property is the ID of the user who triggered the notification.
  notifInvokerId?: string;
  // The `expireAt` property is the date and time when the notification expires.
  expireAt?: string;
  // The `createdAt` property is the date and time when the notification was created.
  createdAt?: string;
}

// This interface defines the properties of a main notification.

/** */
export interface InotifSetting {
  // The `invoices` property indicates whether the user wants to receive notifications about invoices.
  invoices: boolean;
  // The `payments` property indicates whether the user wants to receive notifications about payments.
  payments: boolean;
  // The `orders` property indicates whether the user wants to receive notifications about orders.
  orders: boolean;
  // The `jobCards` property indicates whether the user wants to receive notifications about job cards.
  jobCards: boolean;
  // The `users` property indicates whether the user wants to receive notifications about users.
  users: boolean;
}

// This interface defines the notification settings for a user.
