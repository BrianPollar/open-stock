import { user, userLean } from '@open-stock/stock-auth-server';
import { createNotifications, getCurrentNotificationSettings, sendMail } from '@open-stock/stock-notif-server';
import {
  Iactionwithall,
  IinvoiceRelated,
  Imainnotification,
  IpaymentRelated,
  Ireceipt,
  Isuccess, Iuser,
  TinvoiceType,
  TnotifType
} from '@open-stock/stock-universal';
import {
  addParentToLocals, generateUrId, handleMongooseErr, verifyObjectId, verifyObjectIds
} from '@open-stock/stock-universal-server';
import { Error } from 'mongoose';
import { orderMain } from '../../models/order.model';
import { paymentMain } from '../../models/payment.model';
import { paymentRelatedLean, paymentRelatedMain } from '../../models/printables/paymentrelated/paymentrelated.model';
import { receiptMain } from '../../models/printables/receipt.model';
import { invoiceRelatedLean } from '../../models/printables/related/invoicerelated.model';
import {
  canMakeReceipt,
  deleteManyInvoiceRelated,
  makeInvoiceRelatedPdct,
  updateInvoiceRelatedPayments
} from '../printables/related/invoicerelated';


/**
 * Updates the payment related information.
 * @param paymentRelated - The payment related object to update.
 * @param companyId - The query ID.
 * @returns A promise that resolves to an object containing
 * the success status and the updated payment related ID, if successful.
 */
export const updatePaymentRelated = async(
  paymentRelated: Required<IpaymentRelated>,
  companyId: string
): Promise<Isuccess & { _id?: string }> => {
  paymentRelated.companyId = companyId;
  const isValid = verifyObjectId(paymentRelated.paymentRelated);

  if (!isValid) {
    return { success: false, err: 'unauthourised', status: 401 };
  }

  const related = await paymentRelatedMain
    .findById(paymentRelated.paymentRelated);

  if (!related) {
    return { success: true, status: 200 };
  }


  const updateRes = await paymentRelatedMain.updateOne({
    _id: paymentRelated.paymentRelated
  }, {
    $set: {
      // related.items = paymentRelated.items || related.items;
      orderDate: paymentRelated.orderDate || related['orderDate'],
      paymentDate: paymentRelated.paymentDate || related['paymentDate'],
      // related.payments = paymentRelated.payments || related.payments;
      billingAddress: paymentRelated.billingAddress || related['billingAddress'],
      shippingAddress: paymentRelated.shippingAddress || related['shippingAddress'],
      // related.tax = paymentRelated.tax || related.tax;
      currency: paymentRelated.currency || related['currency'],
      // related.user = paymentRelated.user || related.user;
      isBurgain: paymentRelated.isBurgain || related['isBurgain'],
      shipping: paymentRelated.shipping || related['shipping'],
      manuallyAdded: paymentRelated.manuallyAdded || related['manuallyAdded'],
      paymentMethod: paymentRelated.paymentMethod || related['paymentMethod'],
      orderDeliveryCode: paymentRelated.orderDeliveryCode || related['orderDeliveryCode']
      // related.status = paymentRelated.status || related.status;
    }
  })
    .catch((err: Error) => err);

  if (updateRes instanceof Error) {
    const errResponse = handleMongooseErr(updateRes);

    return errResponse;
  }

  return { success: true, status: 200, _id: related._id };
};

/**
 * Creates or updates a payment-related entity.
 *
 * @param paymentRelated - The payment-related data.
 * @param invoiceRelated - The invoice-related data.
 * @param type - The type of entity ('payment' or 'order').
 * @param extraNotifDesc - Additional notification description.
 * @param companyId - The query ID.
 * @returns A promise that resolves to an
 *  object containing the success status and the ID of the created or updated entity.
 */
export const relegatePaymentRelatedCreation = async(
  res,
  paymentRelated: Required<IpaymentRelated>,
  invoiceRelated: Required<IinvoiceRelated>,
  type: 'payment' | 'order', // say payment or order
  extraNotifDesc: string,
  companyId: string
): Promise<Isuccess & {_id?: string}> => {
  const isValid = verifyObjectId(paymentRelated.paymentRelated);
  let found;

  if (isValid) {
    found = await paymentRelatedLean
      .findOne({ _id: paymentRelated.paymentRelated }).lean().select({ urId: 1 });
  }
  if (!found || paymentRelated.creationType === 'solo') {
    paymentRelated.urId = await generateUrId(paymentRelatedMain);

    const newPayRelated = new paymentRelatedMain(paymentRelated);
    const savedRes = await newPayRelated.save().catch((err: Error) => err);

    if (savedRes instanceof Error) {
      const errResponse = handleMongooseErr(savedRes);

      return errResponse;
    }

    if (savedRes && savedRes._id) {
      addParentToLocals(res, savedRes._id, 'paymentrelateds', 'makeTrackEdit');
    }


    // const relatedId = await relegateInvRelatedCreation(invoiceRelated, extraNotifDesc, true);

    let route: string;
    let title = '';
    let accessor: string;
    let notifType: TnotifType;

    if (type === 'order') {
      route = 'orders';
      title = 'Order Made';
      accessor = 'orders';
      notifType = 'orders';
    } else {
      route = 'payments';
      title = 'Payment Made';
      accessor = 'payments';
      notifType = 'payments';
    }

    const stn = await getCurrentNotificationSettings(companyId);

    if (stn && stn[accessor]) {
      const actions: Iactionwithall[] = [{
        operation: 'view',
        // url: pesapalNotifRedirectUrl + route,
        url: route,
        action: '',
        title
      }];

      const notification: Imainnotification = {
        actions,
        userId: invoiceRelated.billingUserId,
        title,
        body: extraNotifDesc,
        icon: '',
        notifType,
        // photo: string;
        expireAt: '200000'
      };

      const capableUsers = await user.find({})
        .lean().select({ permissions: 1 });
      const _ids: string[] = [];

      if (type === 'order') {
        for (const cuser of capableUsers) {
          if (cuser.permissions.orders) {
            _ids.push(cuser._id);
          }
        }
      } else {
        for (const cuser of capableUsers) {
          if (cuser.permissions.payments) {
            _ids.push(cuser._id);
          }
        }
      }

      const notifFilters = { id: { $in: _ids } };

      await createNotifications({
        notification,
        filters: notifFilters
      });
    }

    return { success: true, status: 200, _id: (savedRes as {_id: string})._id };

    /** return {
      paymentRelated: saved._id as string
      // invoiceRelated: relatedId
    }; */
  } else {
    await updatePaymentRelated(paymentRelated, companyId);

    // await updateInvoiceRelated(invoiceRelated);
    return { success: true, status: 200, _id: (paymentRelated.paymentRelated as unknown as { _id: string})._id };

    /** return {
      paymentRelated: paymentRelated.paymentRelated
      // invoiceRelated: invoiceRelated.invoiceRelated
    }; */
  }
};

/**
 * Creates a payment related product object.
 * @param paymentRelated - The payment related data.
 * @param invoiceRelated - The invoice related data.
 * @param user - The user data.
 * @param meta - The meta data.
 * @returns The payment related product object.
 */
export const makePaymentRelatedPdct = (
  paymentRelated: Required<IpaymentRelated>,
  invoiceRelated: Required<IinvoiceRelated>,
  // eslint-disable-next-line @typescript-eslint/no-shadow
  user: Iuser,
  meta
): IpaymentRelated => ({

  // _id: meta._id,
  // createdAt: meta.createdAt,
  // updatedAt: meta.updatedAt,
  paymentRelated: paymentRelated._id,
  urId: paymentRelated.urId,
  // items: paymentRelated.items,
  orderDate: paymentRelated.orderDate,
  paymentDate: paymentRelated.paymentDate,
  // payments: paymentRelated.payments,
  billingAddress: paymentRelated.billingAddress,
  shippingAddress: paymentRelated.shippingAddress,
  // tax: paymentRelated.tax,
  // currency: paymentRelated.currency,
  // user: paymentRelated.user,
  isBurgain: paymentRelated.isBurgain,
  shipping: paymentRelated.shipping,
  manuallyAdded: paymentRelated.manuallyAdded,
  paymentMethod: paymentRelated.paymentMethod,
  // status: paymentRelated.status,
  ...makeInvoiceRelatedPdct(invoiceRelated, user)
});


/**
 * Deletes multiple payment related documents.

   * @param _ids - An array of string IDs representing the documents to be deleted.
 * @param companyId - The ID of the company associated with the documents.
 * @returns A Promise that resolves to an object indicating the success of the operation.
 */
export const deleteManyPaymentRelated = async(_ids: string[], companyId: string): Promise<Isuccess> => {
  const isValid = verifyObjectIds([..._ids, ...[companyId]]);

  if (!isValid) {
    return { success: false, status: 402, err: 'unauthourised' };
  }

  /* const deletedMany = await paymentRelatedMain
    .deleteMany({ _id: { $in: _ids }, companyId }); */

  const deletedMany = await paymentRelatedMain
    .updateMany({ _id: { $in: _ids }, companyId }, {
      $set: { isDeleted: true }
    });

  if (Boolean(deletedMany)) {
    return { success: Boolean(deletedMany), status: 200 };
  } else {
    return {
      success: Boolean(deletedMany),
      status: 403, err: 'could not delete selected documents, try again in a while'
    };
  }
};

/**
 * Deletes all pay orders linked to a payment or an order.
 * @param paymentRelated - The payment related to the pay orders.
 * @param invoiceRelated - The invoice related to the pay orders.
 * @param where - Specifies whether the pay orders are linked to a payment or an order.
 * @param companyId - The ID of the query.
 */
export const deleteAllPayOrderLinked = async(
  paymentRelated: string,
  invoiceRelated: string,
  where: 'payment' | 'order',
  companyId: string
) => {
  const invoiceRel = await invoiceRelatedLean.findOne({ _id: invoiceRelated })
    .lean()
    .select({ creationType: 1 });

  if (!invoiceRel) {
    return { success: false }; // TODO proper err msg
  }

  await deleteManyPaymentRelated([paymentRelated], companyId);
  await deleteManyInvoiceRelated([invoiceRelated], companyId);
  if (invoiceRel.creationType !== 'solo') {
    /* await paymentMain.deleteOne({ paymentRelated });
    await orderMain.deleteOne({ paymentRelated }); */

    await paymentMain.updateOne({ paymentRelated }, {
      $set: { isDeleted: true }
    });
    await orderMain.updateOne({ paymentRelated }, {
      $set: { isDeleted: true }
    });
  } else if (where === 'payment') {
    /* await paymentMain.deleteOne({ paymentRelated }); */

    await paymentMain.updateOne({ paymentRelated }, {
      $set: { isDeleted: true }
    });
  } else if (where === 'order') {
    /* await orderMain.deleteOne({ paymentRelated }); */

    await orderMain.updateOne({ paymentRelated }, {
      $set: { isDeleted: true }
    });
  }
};

export const makePaymentInstall = async(
  res,
  receipt: Ireceipt,
  relatedId: string,
  companyId: string,
  creationType: TinvoiceType
) => {
  // const pInstall = invoiceRelated.payments[0] as IpaymentInstall;
  if (receipt) {
    if (creationType !== 'solo') {
      const canMake = await canMakeReceipt(relatedId);

      if (!canMake) {
        return false;
      }
    }
    receipt.companyId = companyId;

    receipt.invoiceRelated = relatedId;
    const newInstal = new receiptMain(receipt);
    const savedPinstall = await newInstal.save().catch((err: Error) => err);

    if (savedPinstall instanceof Error) {
      const errResponse = handleMongooseErr(savedPinstall);

      return errResponse;
    }

    if (savedPinstall && savedPinstall._id) {
      addParentToLocals(res, savedPinstall._id, 'receipts', 'makeTrackEdit');
    }

    await updateInvoiceRelatedPayments(savedPinstall as unknown as Ireceipt);

    return { success: true };
  }

  return { success: true };
};


/**
   * Sends a notification to all users with a due date.
   * @returns A promise that resolves to true if all notifications were sent successfully.
   */
export const notifyAllOnDueDate = async() => {
  const now = new Date();
  const withDueDate = await invoiceRelatedLean.find({})
    .gte('toDate', now)
    .lean();
  const all = withDueDate.map(async(inv) => {
    if (!inv.companyId) {
      return false;
    }
    const stn = await getCurrentNotificationSettings(inv.companyId);

    if (!stn.success) {
      return false;
    }
    if (stn && stn['users']) {
      const title = 'Invoice Due Date';
      const actions: Iactionwithall[] = [{
        operation: 'view',
        // url: pesapalNotifRedirectUrl + route,
        url: '/invoices',
        action: '',
        title
      }];

      if (inv.billingUserId) {
        const notification: Imainnotification = {
          actions,
          userId: inv.billingUserId.toString(),
          title,
          body: 'This is to remind you that, You are late on a product payment',
          icon: '',
          notifType: 'users',
          // photo: string;
          expireAt: '200000'
        };

        await createNotifications({
          notification,
          filters: null
        });
      }
      const billingUser = await userLean.findOne({ _id: inv.billingUserId }).lean().select({ email: 1 });

      if (!billingUser) {
        return false;
      }
      const mailOptions = {
        from: 'info@eagleinfosolutions.com',
        to: billingUser.email,
        subject: 'Product Due Date',
        text: billingUser.fname + ' ' + billingUser.lname + ' Seems you are late on a payment, with',
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
<style>
  body {
    background: rgb(238, 238, 238);
  }
.main-div {
  max-width: 400px;
  margin: 0 auto;
  background: #fff;
  font-weight: normal;
}
  h2 {
    text-align:center;
    padding-top: 40px;
  }

  .body-div{
    font-weight: lighter;
    text-align: left;
    width: 80%;
    margin: 0 auto;
    font-size: 0.8em;
  }

  .code-para{
    font-size: 1.2em;
  }

  .last-divi {
    padding-top: 30px;
    text-align: center;
    font-size: 0.7em;
  }

  .compny-divi {
    padding-bottom: 40px;
    text-align: center;
    font-size: 0.7em;
  }

  .img-divi {
    width: 75px;
    height: 75px;
    margin-left: calc(100% - 80px);
  }

  .img-divi-img {
width: 100%;
height: 100%;
    }
</style>
</head>
        <body>
        <div class="main-div">
          <div class="img-divi">
            <img class="img-divi-img" src="https://eagleinfosolutions.com/dist/public/logo2.png" />
          </div>
        <h2>Confirm your email address<h2>
          <div class="body-div">
          Please review the following and to make, Oue systems have .

          <p>Please enter this verification code to get started on Eagle Info Solutions:</p>
          <p class="code-para"><b>Clearify and Eagle Info Solutions that all is okay</b> .</p>
          <p>.</p>
          
          <div>Thanks,
          Eagle Info Solutions
          </div>

          <div class="last-divi">
            <a href="https://eagleinfosolutions.com/support">
            Help
            </a> | <a href="https://eagleinfosolutions.com/support">Contacts</a>
          </div>

          <div class="compny-divi"> Eagle Info Solutions Inc, Kampala Uganda</div>
          </div>
          </div>
          </body>
</html>`
      };

      // to user
      await sendMail(mailOptions);
      // to company
      const mailOptions2 = {
        from: 'info@eagleinfosolutions.com',
        to: billingUser.email,
        subject: 'Product Due Date',
        text: billingUser.fname + ' ' + billingUser.lname + ' Seems you are late on a payment, with',
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
<style>
  body {
    background: rgb(238, 238, 238);
  }
.main-div {
  max-width: 400px;
  margin: 0 auto;
  background: #fff;
  font-weight: normal;
}
  h2 {
    text-align:center;
    padding-top: 40px;
  }

  .body-div{
    font-weight: lighter;
    text-align: left;
    width: 80%;
    margin: 0 auto;
    font-size: 0.8em;
  }

  .code-para{
    font-size: 1.2em;
  }

  .last-divi {
    padding-top: 30px;
    text-align: center;
    font-size: 0.7em;
  }

  .compny-divi {
    padding-bottom: 40px;
    text-align: center;
    font-size: 0.7em;
  }

  .img-divi {
    width: 75px;
    height: 75px;
    margin-left: calc(100% - 80px);
  }

  .img-divi-img {
width: 100%;
height: 100%;
    }
</style>
</head>
        <body>
        <div class="main-div">
          <div class="img-divi">
            <img class="img-divi-img" src="https://eagleinfosolutions.com/dist/public/logo2.png" />
          </div>
        <h2>Confirm your email address<h2>
          <div class="body-div">
          Please review the following and to make, Oue systems have .

          <p>Please enter this verification code to get started on Eagle Info Solutions:</p>
          <p class="code-para"><b>Clearify and Eagle Info Solutions that all is okay</b> .</p>
          <p>.</p>
          
          <div>Thanks,
          Eagle Info Solutions
          </div>

          <div class="last-divi">
            <a href="https://eagleinfosolutions.com/support">
            Help
            </a> | <a href="https://eagleinfosolutions.com/support">Contacts</a>
          </div>

          <div class="compny-divi"> Eagle Info Solutions Inc, Kampala Uganda</div>
          </div>
          </div>
          </body>
</html>`
      };

      await sendMail(mailOptions2);
    }

    return true;
  });

  await Promise.all(all);

  return true;
};


