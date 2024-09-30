import {
  constructFiltersFromBody, lookupLimit, lookupOffset, lookupSort,
  lookupTrackEdit, lookupTrackView, makePredomFilter, requireAuth, roleAuthorisation
} from '@open-stock/stock-universal-server';

import { requireActiveCompany } from '@open-stock/stock-auth-server';
import {
  IcustomRequest, IdataArrayResponse, IfilterAggResponse, IfilterProps, IreviewMain, Isuccess
} from '@open-stock/stock-universal';
import {
  addParentToLocals,
  generateUrId,
  offsetLimitRelegator, stringifyMongooseErr
} from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { Treview, reviewLean, reviewMain } from '../models/review.model';
import { addReview, removeReview } from './item.routes';

/**
 * Logger for review routes
 */
const reviewRoutesLogger = tracer.colorConsole({
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
 * Express router for review routes
 */
export const reviewRoutes = express.Router();

reviewRoutes.post('/add', async(req: IcustomRequest<never, IreviewMain>, res, next) => {
  const review = req.body;

  review.companyId = 'superAdmin';

  review.urId = await generateUrId(reviewMain);
  const newReview = new reviewMain(review);
  let errResponse: Isuccess;

  const saved = await newReview.save()
    .catch(err => {
      reviewRoutesLogger.error('create - err: ', err);
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
    addParentToLocals(res, saved._id, reviewMain.collection.collectionName, 'makeTrackEdit');
  }

  return next();
}, addReview);

reviewRoutes.get('/one/:_id', async(req: IcustomRequest<{ _id: string }, null>, res) => {
  const { _id } = req.params;
  const review = await reviewLean
    .findOne({ _id, ...makePredomFilter(req) })
    .lean();

  if (!review) {
    return res.status(404).send({ success: false, err: 'not found' });
  }

  addParentToLocals(res, review._id, reviewMain.collection.collectionName, 'trackDataView');

  return res.status(200).send(review);
});

reviewRoutes.get(
  '/all/:_id/:offset/:limit',
  async(req: IcustomRequest<{ offset: string; limit: string; _id: string }, null>, res) => {
    const { offset, limit } = offsetLimitRelegator(req.params.offset, req.params.limit);
    const all = await Promise.all([
      reviewLean
        .find({ itemId: req.params._id, ...makePredomFilter(req) })
        .skip(offset)
        .limit(limit)
        .lean(),
      reviewLean.countDocuments({ itemId: req.params._id })
    ]);
    const response: IdataArrayResponse<Treview> = {
      count: all[1],
      data: all[0]
    };

    for (const val of all[0]) {
      addParentToLocals(res, val._id, reviewMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

reviewRoutes.post(
  '/filter',
  requireAuth,
  requireActiveCompany,
  roleAuthorisation('items', 'read'),
  async(req: IcustomRequest<never, IfilterProps>, res) => {
    const { propSort } = req.body;
    const { offset, limit } = offsetLimitRelegator(req.body.offset, req.body.limit);
    const filter = constructFiltersFromBody(req);

    const aggCursor = reviewLean.aggregate<IfilterAggResponse<Treview>>([
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
    const dataArr: IfilterAggResponse<Treview>[] = [];

    for await (const data of aggCursor) {
      dataArr.push(data);
    }

    const all = dataArr[0]?.data || [];
    const count = dataArr[0]?.total?.count || 0;

    const staffsToReturn = all.filter(val => val.userId);
    const response: IdataArrayResponse<Treview> = {
      count,
      data: staffsToReturn
    };

    for (const val of all) {
      addParentToLocals(res, val._id, reviewMain.collection.collectionName, 'trackDataView');
    }

    return res.status(200).send(response);
  }
);

reviewRoutes.get('/getratingcount/:_id/:rating', async(req: IcustomRequest<never, null>, res) => {
  const { id, rating } = req.params;
  const review = await reviewLean
    .find({ itemId: id, rating })
    .lean();

  return res.status(200).send({ count: review.length });
});

reviewRoutes.delete(
  '/delete/one/:_id/:itemId/:rating',
  async(req: IcustomRequest<never, unknown>, res, next) => {
    const { _id } = req.params;

    // const deleted = await reviewMain.findOneAndDelete({ _id });
    const deleted = await reviewMain.updateOne({ _id }, { $set: { isDeleted: true } });

    if (Boolean(deleted)) {
      addParentToLocals(res, _id, reviewMain.collection.collectionName, 'trackDataDelete');

      return next();
    } else {
      return res.status(405).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
  },
  removeReview
);
