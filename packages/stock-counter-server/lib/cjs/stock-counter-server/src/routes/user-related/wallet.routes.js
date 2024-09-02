"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletRoutes = void 0;
const tslib_1 = require("tslib");
const stock_universal_server_1 = require("@open-stock/stock-universal-server");
const express_1 = tslib_1.__importDefault(require("express"));
const fs = tslib_1.__importStar(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const tracer = tslib_1.__importStar(require("tracer"));
const user_wallet_model_1 = require("../../models/printables/wallet/user-wallet.model");
const query_1 = require("../../utils/query");
const stock_auth_server_1 = require("@open-stock/stock-auth-server");
const walletRoutesLogger = tracer.colorConsole({
    format: '{{timestamp}} [{{title}}] {{message}} (in {{file}}:{{line}})',
    dateformat: 'HH:MM:ss.L',
    transport(data) {
        // eslint-disable-next-line no-console
        console.log(data.output);
        const logDir = path_1.default.join(process.cwd() + '/openstockLog/');
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
 * Router for wallet related routes.
 */
exports.walletRoutes = express_1.default.Router();
exports.walletRoutes.post('/create/:companyIdParam', stock_universal_server_1.requireAuth);
exports.walletRoutes.post('/createimg/:companyIdParam', stock_universal_server_1.requireAuth);
exports.walletRoutes.post('/getone', stock_universal_server_1.requireAuth, async (req, res) => {
    const { id, userId } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    let filter2 = {};
    if (id) {
        const isValid = (0, stock_universal_server_1.verifyObjectIds)([id]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter2 = { ...filter2, _id: id };
    }
    /* if (queryId) {
      filter = { ...filter, ...filter };
    } */
    if (userId) {
        const isValid = (0, stock_universal_server_1.verifyObjectIds)([userId]);
        if (!isValid) {
            return res.status(401).send({ success: false, status: 401, err: 'unauthourised' });
        }
        filter2 = { ...filter2, user: userId };
    }
    if (req.body.profileOnly === 'true') {
        const { userId } = req.user;
        filter2 = { user: userId };
    }
    const wallet = await user_wallet_model_1.userWalletLean
        .findOne({ ...filter, ...filter2 })
        .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
        .lean();
    return res.status(200).send(wallet);
});
exports.walletRoutes.get('/getall/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        user_wallet_model_1.userWalletLean
            .find({ ...filter })
            .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .skip(offset)
            .limit(limit)
            .lean(),
        user_wallet_model_1.userWalletLean.countDocuments({ ...filter })
    ]);
    const response = {
        count: all[1],
        data: all[0]
    };
    return res.status(200).send(response);
});
exports.walletRoutes.get('/getbyrole/:offset/:limit/:role/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    const all = await Promise.all([
        user_wallet_model_1.userWalletLean
            .find({ ...filter })
            .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .skip(offset)
            .limit(limit)
            .lean(),
        user_wallet_model_1.userWalletLean.countDocuments({ ...filter })
    ]);
    const walletsToReturn = all[0].filter(val => val.user);
    const response = {
        count: all[1],
        data: walletsToReturn
    };
    return res.status(200).send(response);
});
exports.walletRoutes.post('/search/:offset/:limit/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { offset, limit } = (0, stock_universal_server_1.offsetLimitRelegator)(req.params.offset, req.params.limit);
    const { searchterm, searchKey, extraDetails } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    let filters;
    switch (searchKey) {
        case 'startDate':
        case 'endDate':
        case 'occupation':
        case 'employmentType':
        case 'salary':
            filters = { [searchKey]: { $regex: searchterm, $options: 'i' } };
            break;
        default:
            filters = {};
            break;
    }
    let matchFilter;
    if (!extraDetails) {
        matchFilter = {};
    }
    const all = await Promise.all([
        user_wallet_model_1.userWalletLean
            .find({ ...filter, ...filters })
            .populate([(0, query_1.populateUser)(), (0, stock_auth_server_1.populateTrackEdit)(), (0, stock_auth_server_1.populateTrackView)()])
            .skip(offset)
            .limit(limit)
            .lean(),
        user_wallet_model_1.userWalletLean.countDocuments({ ...filter, ...filters })
    ]);
    const walletsToReturn = all[0].filter(val => val.user);
    const response = {
        count: all[1],
        data: walletsToReturn
    };
    return res.status(200).send(response);
});
exports.walletRoutes.put('/update/:companyIdParam', stock_universal_server_1.requireAuth);
exports.walletRoutes.post('/updateimg/:companyIdParam', stock_universal_server_1.requireAuth);
exports.walletRoutes.put('/deleteone/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { id } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // const deleted = await userWalletMain.findOneAndDelete({ _id: id, ...filter });
    const deleted = await user_wallet_model_1.userWalletMain.updateOne({ _id: id, ...filter }, { $set: { isDeleted: true } });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not find item to remove' });
    }
});
exports.walletRoutes.put('/deletemany/:companyIdParam', stock_universal_server_1.requireAuth, async (req, res) => {
    const { ids } = req.body;
    const { filter } = (0, stock_universal_server_1.makeCompanyBasedQuery)(req);
    /* const deleted = await userWalletMain
      .deleteMany({ _id: { $in: ids }, ...filter })
      .catch(err => {
        walletRoutesLogger.error('deletemany - err: ', err);
  
        return null;
      }); */
    const deleted = await user_wallet_model_1.userWalletMain
        .updateMany({ _id: { $in: ids }, ...filter }, {
        $set: { isDeleted: true }
    })
        .catch(err => {
        walletRoutesLogger.error('deletemany - err: ', err);
        return null;
    });
    if (Boolean(deleted)) {
        return res.status(200).send({ success: Boolean(deleted) });
    }
    else {
        return res.status(404).send({ success: Boolean(deleted), err: 'could not delete selected items, try again in a while' });
    }
});
//# sourceMappingURL=wallet.routes.js.map