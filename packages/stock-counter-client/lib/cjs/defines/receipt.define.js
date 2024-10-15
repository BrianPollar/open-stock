"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Receipt = exports.InvoiceRelated = void 0;
const stock_universal_1 = require("@open-stock/stock-universal");
const rxjs_1 = require("rxjs");
const stock_counter_client_1 = require("../stock-counter-client");
class InvoiceRelated extends stock_universal_1.DatabaseAuto {
    constructor(data) {
        super(data);
        this.ecommerceSale = false;
        this.ecommerceSalePercentage = 0;
        this.invoiceRelated = data.invoiceRelated;
        this.creationType = data.creationType;
        this.invoiceId = data.invoiceId;
        this.billingUser = data.billingUser;
        this.extraCompanyDetails = data.extraCompanyDetails;
        this.items = data.items;
        this.billingUserId = data.billingUserId;
        this.billingUserPhoto = data.billingUserPhoto;
        this.stage = data.stage;
        this.estimateId = data.estimateId;
        this.status = data.status;
        this.cost = data.cost;
        this.tax = data.tax;
        this.balanceDue = data.balanceDue;
        this.subTotal = data.subTotal;
        this.total = data.total;
        this.fromDate = data.fromDate;
        this.toDate = data.toDate;
        this.ecommerceSale = data.ecommerceSale || false;
        this.ecommerceSalePercentage = data.ecommerceSalePercentage || 0;
        this.currency = data.currency;
    }
    static addInvoicePayment(payment) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/invoice/createpayment', payment);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    static updateInvoiceRelated(invoiceRelated) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/invoicerelated/update', invoiceRelated);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.InvoiceRelated = InvoiceRelated;
class Receipt extends InvoiceRelated {
    constructor(data) {
        super(data);
        this.urId = data.urId;
        this.companyId = data.companyId;
        this.amountRcievd = data.amountRcievd;
        this.paymentMode = data.paymentMode;
        this.type = data.type;
        this.date = data.toDate;
        this.amount = data.amount;
    }
    static async getAll(offset = 0, limit = 20) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/receipt/all/${offset}/${limit}`);
        const receipts = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: receipts.count,
            receipts: receipts.data
                .map(val => new Receipt(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/receipt/filter', filter);
        const receipts = await (0, rxjs_1.lastValueFrom)(observer$);
        return {
            count: receipts.count,
            receipts: receipts.data
                .map(val => new Receipt(val))
        };
    }
    static async getOne(urIdOr_id) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeGet(`/receipt/one/${urIdOr_id}`);
        const receipt = await (0, rxjs_1.lastValueFrom)(observer$);
        return new Receipt(receipt);
    }
    static add(vals) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePost('/receipt/create', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    static removeMany(val) {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/receipt/delete/many', val);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    update(vals) {
        vals.receipt._id = this._id;
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makePut('/receipt/update', vals);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
    remove() {
        const observer$ = stock_counter_client_1.StockCounterClient.ehttp
            .makeDelete(`/receipt/delete/one/${this._id}`);
        return (0, rxjs_1.lastValueFrom)(observer$);
    }
}
exports.Receipt = Receipt;
//# sourceMappingURL=receipt.define.js.map