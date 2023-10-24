/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* import express from 'express';
import { offsetLimitRelegator, requireAuth, roleAuthorisation, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import { paymentInstallsLean, paymentInstallsMain } from '../../models/printables/paymentrelated/paymentsinstalls.model';
import { getLogger } from 'log4js';
import { Isuccess } from '@open-stock/stock-universal';*/

/** */
/* export const deleteManyPinstalls = async(ids: string[]): Promise<Isuccess> => {
  const isValid = verifyObjectIds(ids);
  if (!isValid) {
    return { success: false, status: 401, err: 'unauthourised' };
  }

  const deletedMany = await paymentInstallsMain
  // eslint-disable-next-line @typescript-eslint/naming-convention
    .deleteMany({ _id: { $in: ids } })
    .catch(err => {
      paymentInstallsRoutesLogger.error('deletemany - err: ', err);
      return null;
    });
  if (Boolean(deletedMany)) {
    return { success: Boolean(deletedMany), status: 200 };
  } else {
    return { success: Boolean(deletedMany), status: 403, err: 'could not delete selected documents, try again in a while' };
  }
};


const paymentInstallsRoutesLogger = getLogger('routes/paymentInstallsRoutes');

/** */
/* export const paymentInstallsRoutes = express.Router();

paymentInstallsRoutes.get('/getone/:id', requireAuth, async(req, res) => {
  const { id } = req.params;
  const isValid = verifyObjectId(id);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const pInstall = await paymentInstallsLean
    .findById(id)
    .lean();
  return res.status(200).send(pInstall);
});

paymentInstallsRoutes.get('/getall/:offset/:limit', requireAuth, roleAuthorisation('payments'), async(req, res) => {
  const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
  const pInstalls = await paymentInstallsLean
    .find({})
    .skip(offset)
    .limit(limit)
    .lean();
  return res.status(200).send(pInstalls);
});

paymentInstallsRoutes.delete('/deleteone/:id', requireAuth, async(req, res) => {
  const { id } = req.params;
  const isValid = verifyObjectId(id);
  if (!isValid) {
    return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
  }
  const deleted = await paymentInstallsMain.findByIdAndDelete(id);
  if (Boolean(deleted)) {
    return res.status(200).send({ success: Boolean(deleted) });
  } else {
    return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
  }
});

paymentInstallsRoutes.put('/deletemany', requireAuth, roleAuthorisation('payments'), async(req, res) => {
  const { ids } = req.body;
  const done = await deleteManyPinstalls(ids);
  return res.status(done.status).send(done);
});
*/
