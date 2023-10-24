import { IinvoiceRelatedPdct, TestimateStage } from '@open-stock/stock-universal';
import { Estimate } from '../defines/estimate.define';
import { Expense } from '../defines/expense.define';
import { Invoice, InvoiceRelatedWithReceipt } from '../defines/invoice.define';
import { Item } from '../defines/item.define';
/** This is a class called InventoryController that contains various methods related to inventory management. Here is a summary of each method: */
/** */
export declare class InventoryController {
    constructor();
    /** stageRelegator(currStage: TestimateStage, stage: TestimateStage): This method checks if the current stage of an item in the inventory is the same as the specified stage. It returns true if they are the same, otherwise it compares the positions of the stages and returns true if the current stage is before or at the same position as the specified stage. */
    stageRelegator(currStage: TestimateStage, stage: TestimateStage): boolean;
    /** itemExistInRelatedPdct(itemId: string, invPdt: IinvoiceRelatedPdct): This method checks if an item exists in a related product in the inventory. It returns true if the item exists in the related product.
   */
    itemExistInRelatedPdct(itemId: string, invPdt: IinvoiceRelatedPdct): boolean;
    /** calcBulkProfitMarginPdts(items: Item[]): This method calculates the total profit margin for a list of items. It sums up the difference between the selling price and cost price of each item. */
    calcBulkProfitMarginPdts(items: Item[]): number;
    /** calcItemProfitMargin(item: Item): This method calculates the profit margin for a single item. It subtracts the cost price from the selling price of the item. */
    calcItemProfitMargin(item: Item): number;
    /** calcBigExpensePoint(expenses: Expense[]): This method calculates the biggest expense point from a list of expenses. It finds the expense with the highest cost and returns it.*/
    calcBigExpensePoint(expenses: Expense[]): Expense;
    /** calcSubtotal(items: IinvoiceRelatedPdct[]): This method calculates the subtotal for a list of related products in an invoice. It multiplies the amount and quantity of each related product and sums up the results.*/
    calcSubtotal(items: IinvoiceRelatedPdct[]): number;
    /** calcBalanceDue(invoice: Invoice): This method calculates the balance due for an invoice. It subtracts the payment made from the total amount of the invoice. */
    calcBalanceDue(invoice: Invoice): number;
    /** calcTotal(items: InvoiceRelatedWithReceipt[], tax: number): This method calculates the total amount for an invoice, including tax. It calculates the subtotal of the related products and adds the tax amount based on the tax rate. */
    calcTotal(items: IinvoiceRelatedPdct[], tax: number): number;
    /** getAllItemsProfit(related: InvoiceRelatedWithReceipt[], allItems: Item[]): This method calculates the total profit for all items in a list of related invoices. It sums up the profit from each item in each related invoice. */
    getAllItemsProfit(related: InvoiceRelatedWithReceipt[], allItems: Item[]): number;
    /** findItem(id: string, allItems: Item[]): This method finds an item by its ID in a list of all items. It returns the found item. */
    findItem(id: string, allItems: Item[]): Item;
    /** getProfitByItem(itemId: string, related: InvoiceRelatedWithReceipt[], allItems: Item[]): This method calculates the profit for a specific item across all related invoices. It filters the related invoices to find the ones that contain the item and calculates the profit for each invoice. */
    getProfitByItem(itemId: string, related: InvoiceRelatedWithReceipt[], allItems: Item[]): number;
    /** getExpenseByItem(item: Item): This method calculates the total expense for an item. It sums up the cost of each inventory meta entry for the item.*/
    getExpenseByItem(item: Item): number;
    /** deepDateComparison(date: Date, otherDate: Date, position: string): This method compares two dates based on a specified position (year, month, week, or day). It returns an object with properties indicating if the dates are equal, less than, or more than each other. */
    deepDateComparison(date: Date, otherDate: Date, position: string): {
        equal: boolean;
        lessThan: boolean;
        moreThan: boolean;
    };
    /** getExpenseByDay(expenses: Expense[], date: Date): This method calculates the total expense for a specific day. It filters the expenses based on the year, month, and day of the expense date. */
    getExpenseByDay(expenses: Expense[], date: Date): {
        expenses: Expense[];
        total: number;
    };
    /** getExpenseByWeek(expenses: Expense[], date: Date): This method calculates the total expense for a specific week. It filters the expenses based on the year, month, and week of the expense date.*/
    getExpenseByWeek(expenses: Expense[], date: Date): {
        expenses: Expense[];
        total: number;
    };
    /** getExpenseByMonth(expenses: Expense[], date: Date): This method calculates the total expense for a specific month. It filters the expenses based on the year and month of the expense date. */
    getExpenseByMonth(expenses: Expense[], date: Date): {
        expenses: Expense[];
        total: number;
    };
    /** getExpenseByYear(expenses: Expense[], date: Date): This method calculates the total expense for a specific year. It filters the expenses based on the year of the expense date.*/
    getExpenseByYear(expenses: Expense[], date: Date): {
        expenses: Expense[];
        total: number;
    };
    /** getExpenseByDates(expenses: Expense[], lowerDate: Date, upperDate: Date): This method calculates the total expense for a range of dates. It filters the expenses based on the year of the expense date and checks if it falls within the specified range. */
    getExpenseByDates(expenses: Expense[], lowerDate: Date, upperDate: Date): {
        expenses: Expense[];
        total: number;
    };
    /** getSalesByDay(invoiceRelateds: InvoiceRelated[], date: Date): This method calculates the total sales for a specific day. It filters the invoice-related items based on the year, month, and day of the creation date. */
    getSalesByDay(invoiceRelateds: InvoiceRelatedWithReceipt[], date: Date): {
        sales: InvoiceRelatedWithReceipt[];
        total: number;
    };
    /** getSalesByWeek(invoiceRelateds: InvoiceRelated[], date: Date): This method calculates the total sales for a specific week. It filters the invoice-related items based on the year and month of the creation date.*/
    getSalesByWeek(invoiceRelateds: InvoiceRelatedWithReceipt[], date: Date): {
        sales: InvoiceRelatedWithReceipt[];
        total: number;
    };
    /** getSalesByMonth(invoiceRelateds: InvoiceRelated[], date: Date): This method calculates the total sales for a specific month. It filters the invoice-related items based on the year and month of the creation date. */
    getSalesByMonth(invoiceRelateds: InvoiceRelatedWithReceipt[], date: Date): {
        sales: InvoiceRelatedWithReceipt[];
        total: number;
    };
    /** getSalesByYear(invoiceRelateds: InvoiceRelated[], date: Date): This method calculates the total sales for a specific year. It filters the invoice-related items based on the year of the creation date. */
    getSalesByYear(invoiceRelateds: InvoiceRelatedWithReceipt[], date: Date): {
        sales: InvoiceRelatedWithReceipt[];
        total: number;
    };
    /** getSalesByDates(invoiceRelateds: InvoiceRelated[], lowerDate: Date, upperDate: Date): This method calculates the total sales for a range of dates. It filters the invoice-related items based on the year of the creation date and checks if it falls within the specified range.*/
    getSalesByDates(invoiceRelateds: InvoiceRelatedWithReceipt[], lowerDate: Date, upperDate: Date): {
        sales: InvoiceRelatedWithReceipt[];
        total: number;
    };
    /** getInvoicesByDay(invoices: Invoice[], date: Date): This method filters the invoices based on the year, month, and day of the creation date and returns the filtered invoices and the total cost.*/
    getInvoicesByDay(invoices: Invoice[], date: Date): {
        invoices: Invoice[];
        total: number;
    };
    /** getInvoicesByWeek(invoices: Invoice[], date: Date): This method filters the invoices based on the year and month of the creation date and returns the filtered invoices and the total cost. */
    getInvoicesByWeek(invoices: Invoice[], date: Date): {
        invoices: Invoice[];
        total: number;
    };
    /** getInvoicesByMonth(invoices: Invoice[], date: Date): This method filters the invoices based on the year and month of the creation date and returns the filtered invoices and the total cost.*/
    getInvoicesByMonth(invoices: Invoice[], date: Date): {
        invoices: Invoice[];
        total: number;
    };
    /** getInvoicesYear(invoices: Invoice[], date: Date): This method filters the invoices based on the year of the creation date and returns the filtered invoices and the total cost. */
    getInvoicesYear(invoices: Invoice[], date: Date): {
        invoices: Invoice[];
        total: number;
    };
    /** getInvoicesByDates(invoices: Invoice[], lowerDate: Date, upperDate): This method filters the invoices based on the year of the creation date and checks if it falls within the specified range. It returns the filtered invoices and the total cost. */
    getInvoicesByDates(invoices: Invoice[], lowerDate: Date, upperDate: any): {
        invoices: Invoice[];
        total: number;
    };
    /** getEstimatesByMonth(estimates: Estimate[], date: Date): This method filters the estimates based on the year and month of the creation date and returns the filtered estimates and the total cost. */
    getEstimatesByMonth(estimates: Estimate[], date: Date): {
        estimates: Estimate[];
        total: number;
    };
    /** getWeek(fromDate: Date): This method calculates the start and end dates of a week based on a given date. It returns an array of dates representing the days of the week. */
    getWeek(fromDate: Date): Date[];
}
