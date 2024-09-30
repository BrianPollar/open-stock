
import { requireActiveCompany } from '@open-stock/stock-auth-server';
import {
  IcustomRequest, IdataArrayResponse,
  IfilterAggResponse, IfilterProps,
  Isuccess, makeRandomString
} from '@open-stock/stock-universal';
import {
  addParentToLocals, constructFiltersFromBody,
  generateUrId,
  lookupLimit, lookupOffset, lookupSort, lookupTrackEdit,
  lookupTrackView, makeCompanyBasedQuery, offsetLimitRelegator,
  requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds
} from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { Ipromocode, promocodeLean, promocodeMain } from '../models/promocode.model';

/** Logger for promocode routes */
const promocodeRoutesLogger = tracer.colorConsole({
  format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
  dateformat: 'HH:MM:ss.L',
  transport(data) {
    // eslint-disable-next-line no-console
    console.log(data.output);
    const logDir = path.join(process.cwd() + '/openstockLog/');

    fs.mkdir(logDir, { recursive: true }, (err) => {
      if (err) {
        if (err) {
          // eslint-disable-next-line no-console
          console.log('data.output err ', err);
        }
      }
    });
    fs.appendFile(logDir + '/counter-server.log', data.rawoutput + '\n', err => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log('raw.output err ', err);
      }
    });
  }
});

/**
 * Router for handling promo code routes.
 */
export const promocodeRoutes = express.Router();

promocodeRoutes.post(
  '/create',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('items', 'create'),
  async(req: IcustomRequest<never, { items: string; amount; roomId: string }>, res) => {
    const { items, amount, roomId } = req.body;
    const { companyId } = req.user;


    const isValid = verifyObjectId(companyId);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const code = makeRandomString(8, 'combined');

    const urId = await generateUrId(promocodeMain);
    const promocode = {
      urId,
      companyId,
      code,
      amount,
      items,
      roomId,
      expireAt: new Date().toString()
    };
    const newpromocode = new promocodeMain(promocode);
    let errResponse: Isuccess;
    const saved = await newpromocode.save()
      .catch(err => {
        promocodeRoutesLogger.error('create - err: ', err);
        errResponse = {
          success: false,
          status: 403
        };
        if (err && err.errors) {
          errResponse.err = stringifyMongooseErr(err.errors);
        } else {
          errResponse.err = `we are having problems connecting to our databases, 
        try again in a while`;
        }

        return err;
      });

    if (errResponse) {
      return res.status(403).send(errResponse);
    }

    if (saved && saved._id) {
      addParentToLocals(res, saved._id, promocodeMain.collection.collectionName, 'makeTrackEdit');
    }

    return res.status(200).send({ success: Boolean(saved), code });
  }
);

promocodeRoutes.get(
  '/one/:_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('items', 'read'),
  async(req: IcustomRequest<{ _id: string }, null>, res) => {
    const { _id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const promocode = await promocodeLean
      .findOne({ _id, ...filter })
      .lean();

    if (!promocode) {
      return res.status(404).send({ success: false, err: 'not found' });
    }

    addParentToLocals(res, promocode._id, promocodeMain.collection.collectionName, 'trackDataView');

    return res.status(200).send(promocode);
  }
);

promocodeRoutes.get('/getonebycode/:code', async(req: IcustomRequest<never, null>, res) => {
  const { code } = req.params;
  const promocode = await promocodeLean
    .findOne({ code })
    .lean();

  if (promocode) {
    addParentToLocals(res, promocode._id, promocodeMain.collection.collectionName, 'trackDataView');
  }

  return res.status(200).send(promocode);
});

promocodeRoutes.get(
  '/all/:offset/:limit',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('items', 'read'),
  async(req: IcustomRequest<{ offset: string; limit: string }, null>, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const { filter } = makeCompanyBasedQuery(req);
    const all = await Promise.all([
      promocodeLean
        .find(filter)
        .skip(offset)
        .limit(limit)
        .lean(),
      promocodeLean.countDocuments(filter)
    ]);
    const response: IdataArrayResponse<Ipromocode> = {
      count: all[1],
      data: all[0]
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, promocodeMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

promocodeRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('items', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const filter = constructFiltersFromBody(req);

    const aggCursor = promocodeLean.aggregate<IfilterAggResponse<Ipromocode>>([
      {
        $match: {
          $and: [
          // { status: 'pending' },
            ...filter
          ]
        }
      },
      ...lookupTrackEdit(),
      ...lookupTrackView(),
      {
        $facet: {
          data: [...lookupSort(propSort), ...lookupOffset(offset), ...lookupLimit(limit)],
          total: [{ $count: 'count' }]
        }
      },
      {
        $unwind: {
          path: '$total',
          preserveNullAndEmptyArrays: true
        }
      }
    ]);
    const dataArr: IfilterAggResponse<Ipromocode>[] = [];

    for await (const data of aggCursor) {
      dataArr.push(data);
    }

    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;

    const response: IdataArrayResponse<Ipromocode> = {
      count,
      data: all
    };

    for (const val of all) {
      addParentToLocals(res, val._id, promocodeMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

promocodeRoutes.delete(
  '/delete/one/:_id',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('items', 'delete'),
  async(req: IcustomRequest<never, unknown>, res) => {
    const { _id } = req.params;
    const { companyId } = req.user;


    const isValid = verifyObjectIds([_id, companyId]);

    if (!isValid) {
      return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }

    // const deleted = await promocodeMain.findOneAndDelete({ _id, });
    const deleted = await promocodeMain.updateOne({ _id }, { $set: { isDeleted: true } });

    if (Boolean(deleted)) {
      addParentToLocals(res, _id, promocodeMain.collection.collectionName, 'trackDataDelete');

      return res.status(200).send({ success: Boolean(deleted) });
    } else {
      return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
  }
);
