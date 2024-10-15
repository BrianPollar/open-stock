import { DatabaseAuto } from '@open-stock/stock-universal';
import { lastValueFrom } from 'rxjs';
import { StockCounterClient } from '../stock-counter-client';
export class InvoiceRelated extends DatabaseAuto {
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
        const observer$ = StockCounterClient.ehttp
            .makePost('/invoice/createpayment', payment);
        return lastValueFrom(observer$);
    }
    static updateInvoiceRelated(invoiceRelated) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/invoicerelated/update', invoiceRelated);
        return lastValueFrom(observer$);
    }
}
export class Receipt extends InvoiceRelated {
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
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/receipt/all/${offset}/${limit}`);
        const receipts = await lastValueFrom(observer$);
        return {
            count: receipts.count,
            receipts: receipts.data
                .map(val => new Receipt(val))
        };
    }
    static async filterAll(filter) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/receipt/filter', filter);
        const receipts = await lastValueFrom(observer$);
        return {
            count: receipts.count,
            receipts: receipts.data
                .map(val => new Receipt(val))
        };
    }
    static async getOne(urIdOr_id) {
        const observer$ = StockCounterClient.ehttp
            .makeGet(`/receipt/one/${urIdOr_id}`);
        const receipt = await lastValueFrom(observer$);
        return new Receipt(receipt);
    }
    static add(vals) {
        const observer$ = StockCounterClient.ehttp
            .makePost('/receipt/create', vals);
        return lastValueFrom(observer$);
    }
    static removeMany(val) {
        const observer$ = StockCounterClient.ehttp
            .makePut('/receipt/delete/many', val);
        return lastValueFrom(observer$);
    }
    update(vals) {
        vals.receipt._id = this._id;
        const observer$ = StockCounterClient.ehttp
            .makePut('/receipt/update', vals);
        return lastValueFrom(observer$);
    }
    remove() {
        const observer$ = StockCounterClient.ehttp
            .makeDelete(`/receipt/delete/one/${this._id}`);
        return lastValueFrom(observer$);
    }
}
//# sourceMappingURL=receipt.define.js.map