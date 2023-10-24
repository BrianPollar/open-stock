/** This is a class called InventoryController that contains various methods related to inventory management. Here is a summary of each method: */
/** */
export class InventoryController {
    constructor() { }
    /** stageRelegator(currStage: TestimateStage, stage: TestimateStage): This method checks if the current stage of an item in the inventory is the same as the specified stage. It returns true if they are the same, otherwise it compares the positions of the stages and returns true if the current stage is before or at the same position as the specified stage. */
    stageRelegator(currStage, stage) {
        if (currStage === stage) {
            return true;
        }
        else {
            const stagesNum = [
                {
                    name: 'estimate',
                    pos: 0
                },
                {
                    name: 'invoice',
                    pos: 1
                },
                {
                    name: 'deliverynote',
                    pos: 2
                },
                {
                    name: 'receipt',
                    pos: 3
                }
            ];
            const foundEstStage = stagesNum
                .find(val => val.name === stage);
            const foundCurrentStage = stagesNum
                .find(val => val.name === currStage);
            return foundCurrentStage.pos <= foundEstStage.pos;
        }
    }
    /** itemExistInRelatedPdct(itemId: string, invPdt: IinvoiceRelatedPdct): This method checks if an item exists in a related product in the inventory. It returns true if the item exists in the related product.
   */
    itemExistInRelatedPdct(itemId, invPdt) {
        return invPdt.item === itemId;
    }
    /** calcBulkProfitMarginPdts(items: Item[]): This method calculates the total profit margin for a list of items. It sums up the difference between the selling price and cost price of each item. */
    calcBulkProfitMarginPdts(items) {
        return items
            .reduce((acc, pdt) => acc + (pdt.costMeta.sellingPrice - pdt.costMeta.costPrice), 0);
    }
    /** calcItemProfitMargin(item: Item): This method calculates the profit margin for a single item. It subtracts the cost price from the selling price of the item. */
    calcItemProfitMargin(item) {
        return item.costMeta.sellingPrice - item.costMeta.costPrice;
    }
    /** calcBigExpensePoint(expenses: Expense[]): This method calculates the biggest expense point from a list of expenses. It finds the expense with the highest cost and returns it.*/
    calcBigExpensePoint(expenses) {
        const toNums = expenses.map(val => val.cost);
        const max = Math.max(...toNums);
        return expenses.find(val => val.cost === max);
    }
    /** calcSubtotal(items: IinvoiceRelatedPdct[]): This method calculates the subtotal for a list of related products in an invoice. It multiplies the amount and quantity of each related product and sums up the results.*/
    calcSubtotal(items) {
        return items
            .reduce((acc, val) => acc + (val.amount * val.quantity), 0);
    }
    /** calcBalanceDue(invoice: Invoice): This method calculates the balance due for an invoice. It subtracts the payment made from the total amount of the invoice. */
    calcBalanceDue(invoice) {
        return invoice.total - invoice.paymentMade;
    }
    /** calcTotal(items: InvoiceRelatedWithReceipt[], tax: number): This method calculates the total amount for an invoice, including tax. It calculates the subtotal of the related products and adds the tax amount based on the tax rate. */
    calcTotal(items, tax) {
        const total = items
            .reduce((acc, val) => acc + (val.amount * val.quantity), 0);
        const nowTax = (tax / 100) * total;
        return total + nowTax;
    }
    /** getAllItemsProfit(related: InvoiceRelatedWithReceipt[], allItems: Item[]): This method calculates the total profit for all items in a list of related invoices. It sums up the profit from each item in each related invoice. */
    getAllItemsProfit(related, allItems) {
        return related
            .reduce((acc, val) => acc + val.items
            // eslint-disable-next-line max-len
            .reduce((acc1, val1) => acc1 + (val.payments.reduce((acc3, val3) => val3.amount + acc3, 0) - this.findItem(val1.item, allItems)?.costMeta.costPrice || 0), 0), 0);
    }
    /** findItem(id: string, allItems: Item[]): This method finds an item by its ID in a list of all items. It returns the found item. */
    findItem(id, allItems) {
        return allItems.find(p => p._id === id);
    }
    /** getProfitByItem(itemId: string, related: InvoiceRelatedWithReceipt[], allItems: Item[]): This method calculates the profit for a specific item across all related invoices. It filters the related invoices to find the ones that contain the item and calculates the profit for each invoice. */
    getProfitByItem(itemId, related, allItems) {
        const filtered = related
            .filter(val => {
            const found = val.items?.find(pdt => pdt.item === itemId);
            if (found) {
                return val;
            }
            return null;
        });
        return this.getAllItemsProfit(filtered, allItems);
    }
    /** getExpenseByItem(item: Item): This method calculates the total expense for an item. It sums up the cost of each inventory meta entry for the item.*/
    getExpenseByItem(item) {
        return item.inventoryMeta
            .reduce((acc, val) => acc + val.cost, 0);
    }
    /** deepDateComparison(date: Date, otherDate: Date, position: string): This method compares two dates based on a specified position (year, month, week, or day). It returns an object with properties indicating if the dates are equal, less than, or more than each other. */
    deepDateComparison(date, otherDate, position) {
        switch (position) {
            case 'year':
                if (date.getFullYear() === otherDate.getFullYear()) {
                    return {
                        equal: true,
                        lessThan: false,
                        moreThan: false
                    };
                }
                else if (date.getFullYear() > otherDate.getFullYear()) {
                    return {
                        equal: false,
                        lessThan: false,
                        moreThan: true
                    };
                }
                else {
                    return {
                        equal: false,
                        lessThan: true,
                        moreThan: false
                    };
                }
            case 'month':
                if (date.getMonth() === otherDate.getMonth()) {
                    return {
                        equal: true,
                        lessThan: false,
                        moreThan: false
                    };
                }
                else if (date.getMonth() > otherDate.getMonth()) {
                    return {
                        equal: false,
                        lessThan: false,
                        moreThan: true
                    };
                }
                else {
                    return {
                        equal: false,
                        lessThan: true,
                        moreThan: false
                    };
                }
            case 'week': {
                const week = this.getWeek(date);
                const firstDate = new Date(week[0]);
                const lastDate = new Date(week[6]);
                if ((firstDate <= date) && (date <= lastDate)) {
                    return {
                        equal: true,
                        lessThan: false,
                        moreThan: false
                    };
                }
                else if (firstDate <= date) {
                    return {
                        equal: false,
                        lessThan: true,
                        moreThan: false
                    };
                }
                else {
                    return {
                        equal: false,
                        lessThan: false,
                        moreThan: true
                    };
                }
            }
            case 'day':
            default:
                if (date.getDate() === otherDate.getDate()) {
                    return {
                        equal: true,
                        lessThan: false,
                        moreThan: false
                    };
                }
                else if (date.getDate() > otherDate.getDate()) {
                    return {
                        equal: false,
                        lessThan: false,
                        moreThan: true
                    };
                }
                else {
                    return {
                        equal: false,
                        lessThan: true,
                        moreThan: false
                    };
                }
        }
    }
    /** getExpenseByDay(expenses: Expense[], date: Date): This method calculates the total expense for a specific day. It filters the expenses based on the year, month, and day of the expense date. */
    getExpenseByDay(expenses, date) {
        const filtered = expenses
            .filter(val => {
            const expDate = new Date(val.createdAt);
            if (this.deepDateComparison(date, expDate, 'year').equal &&
                this.deepDateComparison(date, expDate, 'month').equal &&
                this.deepDateComparison(date, expDate, 'day').equal) {
                return val;
            }
            return null;
        });
        return {
            expenses: filtered,
            total: filtered.reduce((acc, val) => acc + val.cost, 0)
        };
    }
    /** getExpenseByWeek(expenses: Expense[], date: Date): This method calculates the total expense for a specific week. It filters the expenses based on the year, month, and week of the expense date.*/
    getExpenseByWeek(expenses, date) {
        const filtered = expenses
            .filter(val => {
            const expDate = new Date(val.createdAt);
            if (this.deepDateComparison(date, expDate, 'year').equal &&
                this.deepDateComparison(date, expDate, 'month').equal &&
                this.deepDateComparison(date, expDate, 'week').equal) {
                return val;
            }
            return null;
        });
        return {
            expenses: filtered,
            total: filtered.reduce((acc, val) => acc + val.cost, 0)
        };
    }
    /** getExpenseByMonth(expenses: Expense[], date: Date): This method calculates the total expense for a specific month. It filters the expenses based on the year and month of the expense date. */
    getExpenseByMonth(expenses, date) {
        const filtered = expenses
            .filter(val => {
            const expDate = new Date(val.createdAt);
            if (this.deepDateComparison(date, expDate, 'year').equal &&
                this.deepDateComparison(date, expDate, 'month').equal) {
                return val;
            }
            return null;
        });
        return {
            expenses: filtered,
            total: filtered.reduce((acc, val) => acc + val.cost, 0)
        };
    }
    /** getExpenseByYear(expenses: Expense[], date: Date): This method calculates the total expense for a specific year. It filters the expenses based on the year of the expense date.*/
    getExpenseByYear(expenses, date) {
        const filtered = expenses
            .filter(val => {
            const expDate = new Date(val.createdAt);
            if (this.deepDateComparison(date, expDate, 'year').equal) {
                return val;
            }
            return null;
        });
        return {
            expenses: filtered,
            total: filtered.reduce((acc, val) => acc + val.cost, 0)
        };
    }
    /** getExpenseByDates(expenses: Expense[], lowerDate: Date, upperDate: Date): This method calculates the total expense for a range of dates. It filters the expenses based on the year of the expense date and checks if it falls within the specified range. */
    getExpenseByDates(expenses, lowerDate, upperDate) {
        const filtered = expenses
            .filter(val => {
            const expDate = new Date(val.createdAt);
            if (this.deepDateComparison(lowerDate, expDate, 'year').moreThan &&
                this.deepDateComparison(upperDate, expDate, 'year').lessThan) {
                return val;
            }
            return null;
        });
        return {
            expenses: filtered,
            total: filtered.reduce((acc, val) => acc + val.cost, 0)
        };
    }
    /** getSalesByDay(invoiceRelateds: InvoiceRelated[], date: Date): This method calculates the total sales for a specific day. It filters the invoice-related items based on the year, month, and day of the creation date. */
    getSalesByDay(invoiceRelateds, date) {
        const filtered = invoiceRelateds
            .filter(val => {
            const saleDate = new Date(val.createdAt);
            if (this.deepDateComparison(date, saleDate, 'year').equal &&
                this.deepDateComparison(date, saleDate, 'month').equal &&
                this.deepDateComparison(date, saleDate, 'day').equal) {
                return val;
            }
            return null;
        });
        return {
            sales: filtered,
            total: filtered.reduce((acc, val) => acc + val.payments.reduce((acc1, val1) => acc1 + val1.amount, 0), 0)
        };
    }
    /** getSalesByWeek(invoiceRelateds: InvoiceRelated[], date: Date): This method calculates the total sales for a specific week. It filters the invoice-related items based on the year and month of the creation date.*/
    getSalesByWeek(invoiceRelateds, date) {
        const filtered = invoiceRelateds
            .filter(val => {
            const saleDate = new Date(val.createdAt);
            if (this.deepDateComparison(date, saleDate, 'year').equal &&
                this.deepDateComparison(date, saleDate, 'month').equal) {
                return val;
            }
            return null;
        });
        return {
            sales: filtered,
            total: filtered.reduce((acc, val) => acc + val.payments.reduce((acc1, val1) => acc1 + val1.amount, 0), 0)
        };
    }
    /** getSalesByMonth(invoiceRelateds: InvoiceRelated[], date: Date): This method calculates the total sales for a specific month. It filters the invoice-related items based on the year and month of the creation date. */
    getSalesByMonth(invoiceRelateds, date) {
        const filtered = invoiceRelateds
            .filter(val => {
            const saleDate = new Date(val.createdAt);
            if (this.deepDateComparison(date, saleDate, 'year').equal &&
                this.deepDateComparison(date, saleDate, 'month').equal) {
                return val;
            }
            return null;
        });
        return {
            sales: filtered,
            total: filtered.reduce((acc, val) => acc + val.payments.reduce((acc1, val1) => acc1 + val1.amount, 0), 0)
        };
    }
    /** getSalesByYear(invoiceRelateds: InvoiceRelated[], date: Date): This method calculates the total sales for a specific year. It filters the invoice-related items based on the year of the creation date. */
    getSalesByYear(invoiceRelateds, date) {
        const filtered = invoiceRelateds
            .filter(val => {
            const saleDate = new Date(val.createdAt);
            if (this.deepDateComparison(date, saleDate, 'year').equal) {
                return val;
            }
            return null;
        });
        return {
            sales: filtered,
            total: filtered.reduce((acc, val) => acc + val.payments.reduce((acc1, val1) => acc1 + val1.amount, 0), 0)
        };
    }
    /** getSalesByDates(invoiceRelateds: InvoiceRelated[], lowerDate: Date, upperDate: Date): This method calculates the total sales for a range of dates. It filters the invoice-related items based on the year of the creation date and checks if it falls within the specified range.*/
    getSalesByDates(invoiceRelateds, lowerDate, upperDate) {
        const filtered = invoiceRelateds
            .filter(val => {
            const expDate = new Date(val.createdAt);
            if (this.deepDateComparison(lowerDate, expDate, 'year').moreThan &&
                this.deepDateComparison(upperDate, expDate, 'year').lessThan) {
                return val;
            }
            return null;
        });
        return {
            sales: filtered,
            total: filtered.reduce((acc, val) => acc + val.payments.reduce((acc1, val1) => acc1 + val1.amount, 0), 0)
        };
    }
    /** getInvoicesByDay(invoices: Invoice[], date: Date): This method filters the invoices based on the year, month, and day of the creation date and returns the filtered invoices and the total cost.*/
    getInvoicesByDay(invoices, date) {
        const filtered = invoices
            .filter(val => {
            const saleDate = new Date(val.createdAt);
            if (this.deepDateComparison(date, saleDate, 'year').equal &&
                this.deepDateComparison(date, saleDate, 'month').equal &&
                this.deepDateComparison(date, saleDate, 'day').equal) {
                return val;
            }
            return null;
        });
        return {
            invoices: filtered,
            total: filtered.reduce((acc, val) => acc + val.cost, 0)
        };
    }
    /** getInvoicesByWeek(invoices: Invoice[], date: Date): This method filters the invoices based on the year and month of the creation date and returns the filtered invoices and the total cost. */
    getInvoicesByWeek(invoices, date) {
        const filtered = invoices
            .filter(val => {
            const saleDate = new Date(val.createdAt);
            if (this.deepDateComparison(date, saleDate, 'year').equal &&
                this.deepDateComparison(date, saleDate, 'month').equal) {
                return val;
            }
            return null;
        });
        return {
            invoices: filtered,
            total: filtered.reduce((acc, val) => acc + val.cost, 0)
        };
    }
    /** getInvoicesByMonth(invoices: Invoice[], date: Date): This method filters the invoices based on the year and month of the creation date and returns the filtered invoices and the total cost.*/
    getInvoicesByMonth(invoices, date) {
        const filtered = invoices
            .filter(val => {
            const expDate = new Date(val.createdAt);
            if (this.deepDateComparison(date, expDate, 'year').equal &&
                this.deepDateComparison(date, expDate, 'month').equal) {
                return val;
            }
            return null;
        });
        return {
            invoices: filtered,
            total: filtered.reduce((acc, val) => acc + val.cost, 0)
        };
    }
    /** getInvoicesYear(invoices: Invoice[], date: Date): This method filters the invoices based on the year of the creation date and returns the filtered invoices and the total cost. */
    getInvoicesYear(invoices, date) {
        const filtered = invoices
            .filter(val => {
            const saleDate = new Date(val.createdAt);
            if (this.deepDateComparison(date, saleDate, 'year').equal) {
                return val;
            }
            return null;
        });
        return {
            invoices: filtered,
            total: filtered.reduce((acc, val) => acc + val.cost, 0)
        };
    }
    /** getInvoicesByDates(invoices: Invoice[], lowerDate: Date, upperDate): This method filters the invoices based on the year of the creation date and checks if it falls within the specified range. It returns the filtered invoices and the total cost. */
    getInvoicesByDates(invoices, lowerDate, upperDate) {
        const filtered = invoices
            .filter(val => {
            const expDate = new Date(val.createdAt);
            if (this.deepDateComparison(lowerDate, expDate, 'year').moreThan &&
                this.deepDateComparison(upperDate, expDate, 'year').lessThan) {
                return val;
            }
            return null;
        });
        return {
            invoices: filtered,
            total: filtered.reduce((acc, val) => acc + val.cost, 0)
        };
    }
    /** getEstimatesByMonth(estimates: Estimate[], date: Date): This method filters the estimates based on the year and month of the creation date and returns the filtered estimates and the total cost. */
    getEstimatesByMonth(estimates, date) {
        const filtered = estimates
            .filter(val => {
            const expDate = new Date(val.createdAt);
            if (this.deepDateComparison(date, expDate, 'year').equal &&
                this.deepDateComparison(date, expDate, 'month').equal) {
                return val;
            }
            return null;
        });
        return {
            estimates: filtered,
            total: filtered.reduce((acc, val) => acc + val.cost, 0)
        };
    }
    /** getWeek(fromDate: Date): This method calculates the start and end dates of a week based on a given date. It returns an array of dates representing the days of the week. */
    getWeek(fromDate) {
        const sunday = new Date(fromDate.setDate(fromDate.getDate() - fromDate.getDay()));
        const result = [new Date(sunday)];
        while (sunday.setDate(sunday.getDate() + 1) && sunday.getDay() !== 0) {
            result.push(new Date(sunday));
        }
        return result;
    }
}
//# sourceMappingURL=inventory.controller.js.map