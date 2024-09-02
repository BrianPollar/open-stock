/* eslint-disable @typescript-eslint/no-misused-promises */
import { requireActiveCompany } from '@open-stock/stock-auth-server';
import { makeRandomString } from '@open-stock/stock-universal';
import { addParentToLocals, makeCompanyBasedQuery, makeUrId, offsetLimitRelegator, requireAuth, roleAuthorisation, stringifyMongooseErr, verifyObjectId, verifyObjectIds } from '@open-stock/stock-universal-server';
import express from 'express';
import * as fs from 'fs';
import path from 'path';
import * as tracer from 'tracer';
import { promocodeLean, promocodeMain } from '../models/promocode.model';
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
/**
 * Route for creating a new promocode
 * @name POST /create
 * @function
 * @memberof module:routes/promocodeRoutes
 * @inner
 * @param {string[]} items - Array of item IDs that the promocode applies to
 * @param {number} amount - Discount amount in cents
 * @param {string} roomId - ID of the room the promocode applies to
 * @returns {Promise<Isuccess>} - Promise representing the success or failure of the operation
 */
promocodeRoutes.post('/create/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('items', 'create'), async (req, res) => {
    const { items, amount, roomId } = req.body;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectId(queryId);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    const code = makeRandomString(8, 'combined');
    const count = await promocodeMain
        .find({}).sort({ _id: -1 }).limit(1).lean().select({ urId: 1 });
    const urId = makeUrId(Number(count[0]?.urId || '0'));
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
    let errResponse;
    const saved = await newpromocode.save()
        .catch(err => {
        promocodeRoutesLogger.error('create - err: ', err);
        errResponse = {
            success: false,
            status: 403
        };
        if (err && err.errors) {
            errResponse.err = stringifyMongooseErr(err.errors);
        }
        else {
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
});
/**
 * Route for getting a single promocode by ID
 * @name GET /getone/:id
 * @function
 * @memberof module:routes/promocodeRoutes
 * @inner
 * @param {string} id - ID of the promocode to retrieve
 * @returns {Promise<object>} - Promise representing the retrieved promocode
 */
promocodeRoutes.get('/getone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('items', 'read'), async (req, res) => {
    const { id } = req.params;
    const { filter } = makeCompanyBasedQuery(req);
    const promocode = await promocodeLean
        .findOne({ _id: id, ...filter })
        .lean();
    if (promocode) {
        addParentToLocals(res, promocode._id, promocodeMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(promocode);
});
/**
 * Route for getting a single promocode by code
 * @name GET /getonebycode/:code
 * @function
 * @memberof module:routes/promocodeRoutes
 * @inner
 * @param {string} code - Code of the promocode to retrieve
 * @returns {Promise<object>} - Promise representing the retrieved promocode
 */
promocodeRoutes.get('/getonebycode/:code/:companyIdParam', async (req, res) => {
    const { code } = req.params;
    const promocode = await promocodeLean
        .findOne({ code })
        .lean();
    if (promocode) {
        addParentToLocals(res, promocode._id, promocodeMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(promocode);
});
/**
 * Route for getting all promocodes with pagination
 * @name GET /getall/:offset/:limit
 * @function
 * @memberof module:routes/promocodeRoutes
 * @inner
 * @param {string} offset - Offset for pagination
 * @param {string} limit - Limit for pagination
 * @returns {Promise<object[]>} - Promise representing the retrieved promocodes
 */
promocodeRoutes.get('/getall/:offset/:limit/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('items', 'read'), async (req, res) => {
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
    const response = {
        count: all[1],
        data: all[0]
    };
    for (const val of all[0]) {
        addParentToLocals(res, val._id, promocodeMain.collection.collectionName, 'trackDataView');
    }
    return res.status(200).send(response);
});
/**
 * Route for deleting a single promocode by ID
 * @name DELETE /deleteone/:id
 * @function
 * @memberof module:routes/promocodeRoutes
 * @inner
 * @param {string} id - ID of the promocode to delete
 * @returns {Promise<Isuccess>} - Promise representing the success or failure of the operation
 */
promocodeRoutes.delete('/deleteone/:id/:companyIdParam', requireAuth, requireActiveCompany, roleAuthorisation('items', 'delete'), async (req, res) => {
    const { id } = req.params;
    const { companyId } = req.user;
    const { companyIdParam } = req.params;
    const queryId = companyId === 'superAdmin' ? companyIdParam : companyId;
    const isValid = verifyObjectIds([id, queryId]);
    if (!isValid) {
        return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // const deleted = await promocodeMain.findOneAndDelete({ _id: id, companyId: queryId });
    const deleted = await promocodeMain.updateOne({ _id: id, companyId: queryId }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        addParentToLocals(res, id, promocodeMain.collection.collectionName, 'trackDataDelete');
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
//# sourceMappingURL=promo.routes.js.map