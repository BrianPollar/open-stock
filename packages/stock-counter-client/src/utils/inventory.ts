import { IinvoiceRelatedPdct, TestimateStage } from '@open-stock/stock-universal';
import { Estimate } from '../defines/estimate.define';
import { Expense } from '../defines/expense.define';
import { Invoice, InvoiceRelatedWithReceipt } from '../defines/invoice.define';
import { Item } from '../defines/item.define';

/**
 * This is a class called InventoryController that contains various methods related to inventory management.
 */
export class InventoryController {
  constructor() { }

  /**
   * Calculates the company's percentage from an e-commerce sale.
   * @param amount - The total amount of the e-commerce sale.
   * @param ecommerceSalePercentage - The percentage of the sale that goes to the e-commerce platform.
   * @returns The amount that the company will receive from the e-commerce sale.
   */
  getCompanyPercentageFromEcommerceSale(
    amount: number,
    ecommerceSalePercentage: number
  ) {
    if (!ecommerceSalePercentage || ecommerceSalePercentage >= 100) {
      // we dont allow 100% cat off
      ecommerceSalePercentage = 0;
    }

    return ((100 - ecommerceSalePercentage) / 100) * amount;
  }

  /**
   * This method checks if the current stage of an item in the inventory is the same as the specified stage. It returns true if they are the same, otherwise it compares the positions of the stages and returns true if the current stage is before or at the same position as the specified stage.
   * @param currStage - The current stage of the item.
   * @param stage - The specified stage to compare with.
   * @returns A boolean value indicating whether the current stage is the same as or before the specified stage.
   */
  stageRelegator(currStage: TestimateStage, stage: TestimateStage) {
    if (currStage === stage) {
      return true;
    } else {
      const stagesNum: { name: TestimateStage; pos: number }[] = [
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

  /**
   * This method checks if an item exists in a related product in the inventory. It returns true if the item exists in the related product.
   * @param itemId - The ID of the item to check.
   * @param invPdt - The related product to check.
   * @returns A boolean value indicating whether the item exists in the related product.
   */
  itemExistInRelatedPdct(itemId: string, invPdt: IinvoiceRelatedPdct) {
    return invPdt.item === itemId;
  }

  /**
   * This method calculates the total profit margin for a list of items. It sums up the difference between the selling price and cost price of each item.
   * @param items - The list of items to calculate the profit margin for.
   * @returns The total profit margin for the list of items.
   */
  calcBulkProfitMarginPdts(items: Item[], ecommerceSalePercentage = 0) {
    return items
      .reduce((acc, pdt) => acc + (this.getCompanyPercentageFromEcommerceSale(pdt.costMeta.sellingPrice, ecommerceSalePercentage) - pdt.costMeta.costPrice), 0);
  }

  /**
   * This method calculates the profit margin for a single item. It subtracts the cost price from the selling price of the item.
   * @param item - The item to calculate the profit margin for.
   * @returns The profit margin for the item.
   */
  calcItemProfitMargin(item: Item, ecommerceSalePercentage = 0) {
    return this.getCompanyPercentageFromEcommerceSale(item.costMeta.sellingPrice, ecommerceSalePercentage) - item.costMeta.costPrice;
  }

  /**
   * This method calculates the biggest expense point from a list of expenses. It finds the expense with the highest cost and returns it.
   * @param expenses - The list of expenses to find the biggest expense point from.
   * @returns The expense with the highest cost.
   */
  calcBigExpensePoint(expenses: Expense[]) {
    const toNums = expenses.map(val => val.cost);
    const max = Math.max(...toNums);

    return expenses.find(val => val.cost === max);
  }

  /**
   * This method calculates the subtotal for a list of related products in an invoice. It multiplies the amount and quantity of each related product and sums up the results.
   * @param items - The list of related products to calculate the subtotal for.
   * @returns The subtotal for the list of related products.
   */
  calcSubtotal(items: IinvoiceRelatedPdct[], ecommerceSalePercentage = 0) {
    return items
      .reduce((acc, val) => acc + (this.getCompanyPercentageFromEcommerceSale(val.amount, ecommerceSalePercentage) * val.quantity), 0);
  }

  /**
   * This method calculates the balance due for an invoice. It subtracts the payment made from the total amount of the invoice.
   * @param invoice - The invoice to calculate the balance due for.
   * @returns The balance due for the invoice.
   */
  calcBalanceDue(invoice: Invoice) {
    return this.getCompanyPercentageFromEcommerceSale(invoice.total, invoice.ecommerceSalePercentage) - invoice.paymentMade;
  }

  /**
   * This method calculates the total amount for an invoice, including tax. It calculates the subtotal of the related products and adds the tax amount based on the tax rate.
   * @param items - The list of related products to calculate the total amount for.
   * @param tax - The tax rate to apply.
   * @returns The total amount for the invoice, including tax.
   */
  calcTotal(items: IinvoiceRelatedPdct[], tax: number) {
    const total = items
      .reduce((acc, val) => acc + (val.amount * val.quantity), 0);
    const nowTax = (tax / 100) * total;

    return total + nowTax;
  }

  /**
   * This method calculates the total profit for all items in a list of related invoices. It sums up the profit from each item in each related invoice.
   * @param related - The list of related invoices to calculate the total profit for.
   * @param allItems - The list of all items to use for calculating the profit.
   * @returns The total profit for all items in the list of related invoices.
   */
  getAllItemsProfit(related: InvoiceRelatedWithReceipt[], allItems: Item[]) {
    return related
      .reduce((acc, val) => acc + val.items
        // eslint-disable-next-line max-len
        .reduce((acc1, val1) => acc1 + (val.payments?.reduce((acc3, val3) => (this.getCompanyPercentageFromEcommerceSale(val3.amount, val.ecommerceSalePercentage) + acc3), 0) - this.findItem(val1.item, allItems)?.costMeta.costPrice || 0), 0), 0);
  }

  /**
   * This method finds an item by its ID in a list of all items. It returns the found item.
   * @param id - The ID of the item to find.
   * @param allItems - The list of all items to search in.
   * @returns The found item, or undefined if no item was found.
   */
  findItem(id: string, allItems: Item[]) {
    return allItems.find(p => p._id === id);
  }

  /**
   * This method calculates the profit for a specific item across all related invoices. It filters the related invoices to find the ones that contain the item and calculates the profit for each invoice.
   * @param itemId - The ID of the item to calculate the profit for.
   * @param related - The list of related invoices to calculate the profit for.
   * @param allItems - The list of all items to use for calculating the profit.
   * @returns The profit for the item across all related invoices.
   */
  getProfitByItem(itemId: string, related: InvoiceRelatedWithReceipt[], allItems: Item[]) {
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

  /** getExpenseByItem(item: Item): This method calculates the total expense for an item. It sums up the cost of each inventory meta entry for the item. */
  getExpenseByItem(item: Item) {
    return item.inventoryMeta
      .reduce((acc, val) => acc + val.cost, 0);
  }

  /**
   * Compares two dates deeply based on the specified position.
   * @param date The first date to compare.
   * @param otherDate The second date to compare.
   * @param position The position to compare the dates on. Can be 'year', 'month', 'week', or 'day'.
   * @returns An object indicating the comparison result, with properties 'equal', 'lessThan', and 'moreThan'.
   */
  deepDateComparison(
    date: Date,
    otherDate: Date,
    position: string
  ) {
    switch (position) {
      case 'year':
        if (date.getFullYear() === otherDate.getFullYear()) {
          return {
            equal: true,
            lessThan: false,
            moreThan: false
          };
        } else if (date.getFullYear() > otherDate.getFullYear()) {
          return {
            equal: false,
            lessThan: false,
            moreThan: true
          };
        } else {
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
        } else if (date.getMonth() > otherDate.getMonth()) {
          return {
            equal: false,
            lessThan: false,
            moreThan: true
          };
        } else {
          return {
            equal: false,
            lessThan: true,
            moreThan: false
          };
        }
      case 'week':{
        const week = this.getWeek(date);
        const firstDate = new Date(week[0]);
        const lastDate = new Date(week[6]);

        if ((firstDate <= date) && (date <= lastDate)) {
          return {
            equal: true,
            lessThan: false,
            moreThan: false
          };
        } else if (firstDate <= date) {
          return {
            equal: false,
            lessThan: true,
            moreThan: false
          };
        } else {
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
        } else if (date.getDate() > otherDate.getDate()) {
          return {
            equal: false,
            lessThan: false,
            moreThan: true
          };
        } else {
          return {
            equal: false,
            lessThan: true,
            moreThan: false
          };
        }
    }
  }

  /**
   * Retrieves expenses and calculates the total cost for a specific day.
   * @param expenses - The array of expenses.
   * @param date - The date to filter the expenses by.
   * @returns An object containing the filtered expenses and the total cost.
   */
  getExpenseByDay(expenses: Expense[], date: Date) {
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

  /**
   * Retrieves expenses and calculates the total cost for a specific week.
   * @param expenses - The array of expenses.
   * @param date - The reference date to filter expenses by week.
   * @returns An object containing the filtered expenses and the total cost.
   */
  getExpenseByWeek(expenses: Expense[], date: Date) {
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

  /**
   * Retrieves expenses for a specific month.
   * @param expenses - The array of expenses.
   * @param date - The target month.
   * @returns An object containing the filtered expenses and the total cost.
   */
  getExpenseByMonth(expenses: Expense[], date: Date) {
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

  /**
   * Retrieves expenses for a specific year.
   * @param expenses - The array of expenses.
   * @param date - The date to filter expenses by year.
   * @returns An object containing the filtered expenses and the total cost.
   */
  getExpenseByYear(expenses: Expense[], date: Date) {
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

  /**
   * Retrieves expenses within a specified date range.
   * @param expenses - The array of expenses to filter.
   * @param lowerDate - The lower bound of the date range.
   * @param upperDate - The upper bound of the date range.
   * @returns An object containing the filtered expenses and the total cost.
   */
  getExpenseByDates(expenses: Expense[], lowerDate: Date, upperDate: Date) {
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

  /**
   * Retrieves the sales made on a specific day.
   * @param invoiceRelateds - An array of invoice related objects.
   * @param date - The date to filter the sales by.
   * @returns An object containing the filtered sales and the total amount of payments made on that day.
   */
  getSalesByDay(invoiceRelateds: InvoiceRelatedWithReceipt[], date: Date) {
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
      total: filtered.reduce((acc, val) => acc + this.getCompanyPercentageFromEcommerceSale(val.payments.reduce((acc1, val1) => acc1 + val1.amount, 0), val.ecommerceSalePercentage), 0)
    };
  }

  /**
   * Retrieves sales by week based on the given invoice related data and date.
   * @param invoiceRelateds - The array of invoice related data.
   * @param date - The date used for filtering the sales.
   * @returns An object containing the filtered sales and the total amount of payments.
   */
  getSalesByWeek(invoiceRelateds: InvoiceRelatedWithReceipt[], date: Date) {
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
      total: filtered?.reduce((acc, val) => acc + this.getCompanyPercentageFromEcommerceSale(val.payments?.reduce((acc1, val1) => acc1 + val1.amount, 0), val.ecommerceSalePercentage), 0)
    };
  }

  /**
   * Retrieves the sales for a specific month.
   * @param invoiceRelateds - The array of invoice related objects.
   * @param date - The date representing the month to filter the sales.
   * @returns An object containing the filtered sales and the total amount of payments.
   */
  getSalesByMonth(invoiceRelateds: InvoiceRelatedWithReceipt[], date: Date) {
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
      total: filtered?.reduce((acc, val) => acc + this.getCompanyPercentageFromEcommerceSale(val.payments?.reduce((acc1, val1) => acc1 + val1.amount, 0), val.ecommerceSalePercentage), 0)
    };
  }

  /**
   * Retrieves sales data for a specific year.
   * @param invoiceRelateds - An array of invoice related objects.
   * @param date - The target date to filter the sales by year.
   * @returns An object containing the filtered sales and the total amount of payments.
   */
  getSalesByYear(invoiceRelateds: InvoiceRelatedWithReceipt[], date: Date) {
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
      total: filtered?.reduce((acc, val) => acc + this.getCompanyPercentageFromEcommerceSale(val.payments?.reduce((acc1, val1) => acc1 + val1.amount, 0), val.ecommerceSalePercentage), 0)
    };
  }

  /**
   * Retrieves sales data from the given invoice related items within the specified date range.
   * @param invoiceRelateds - The array of invoice related items.
   * @param lowerDate - The lower bound of the date range.
   * @param upperDate - The upper bound of the date range.
   * @returns An object containing the filtered sales data and the total sales amount.
   */
  getSalesByDates(invoiceRelateds: InvoiceRelatedWithReceipt[], lowerDate: Date, upperDate: Date) {
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
      total: filtered.reduce((acc, val) => acc + this.getCompanyPercentageFromEcommerceSale(val.payments.reduce((acc1, val1) => acc1 + val1.amount, 0), val.ecommerceSalePercentage), 0)
    };
  }

  /**
   * Retrieves invoices and calculates the total cost for a specific day.
   * @param invoices - The array of invoices to filter.
   * @param date - The specific date to filter the invoices by.
   * @returns An object containing the filtered invoices and the total cost.
   */
  getInvoicesByDay(invoices: Invoice[], date: Date) {
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
      total: filtered.reduce((acc, val) => acc + this.getCompanyPercentageFromEcommerceSale(val.cost, val.ecommerceSalePercentage), 0)
    };
  }

  /**
   * Retrieves invoices for a specific week based on the given date.
   * @param invoices - The array of invoices to filter.
   * @param date - The date used to determine the week.
   * @returns An object containing the filtered invoices and the total cost.
   */
  getInvoicesByWeek(invoices: Invoice[], date: Date) {
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
      total: filtered.reduce((acc, val) => acc + this.getCompanyPercentageFromEcommerceSale(val.cost, val.ecommerceSalePercentage), 0)
    };
  }

  /**
   * Retrieves invoices for a specific month.
   * @param invoices - The list of invoices.
   * @param date - The target month.
   * @returns An object containing the filtered invoices and their total cost.
   */
  getInvoicesByMonth(invoices: Invoice[], date: Date) {
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
      total: filtered.reduce((acc, val) => acc + this.getCompanyPercentageFromEcommerceSale(val.cost, val.ecommerceSalePercentage), 0)
    };
  }

  /**
   * Retrieves the invoices and calculates the total cost for a specific year.
   * @param invoices - The array of invoices to filter.
   * @param date - The target year to filter the invoices.
   * @returns An object containing the filtered invoices and the total cost.
   */
  getInvoicesYear(invoices: Invoice[], date: Date) {
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
      total: filtered.reduce((acc, val) => acc + this.getCompanyPercentageFromEcommerceSale(val.cost, val.ecommerceSalePercentage), 0)
    };
  }

  /**
   * Retrieves invoices within a specified date range.
   * @param invoices - The array of invoices to filter.
   * @param lowerDate - The lower bound of the date range.
   * @param upperDate - The upper bound of the date range.
   * @returns An object containing the filtered invoices and the total cost.
   */
  getInvoicesByDates(invoices: Invoice[], lowerDate: Date, upperDate) {
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
      total: filtered.reduce((acc, val) => acc + this.getCompanyPercentageFromEcommerceSale(val.cost, val.ecommerceSalePercentage), 0)
    };
  }

  /**
   * Retrieves estimates by month.
   * @param estimates - The array of estimates.
   * @param date - The target date.
   * @returns An object containing the filtered estimates and their total cost.
   */
  getEstimatesByMonth(estimates: Estimate[], date: Date) {
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
      total: filtered.reduce((acc, val) => acc + this.getCompanyPercentageFromEcommerceSale(val.cost, val.ecommerceSalePercentage), 0)
    };
  }

  /**
   * Returns an array of dates representing the week starting from the given date.
   * The week starts from Sunday and ends on Saturday.
   * @param fromDate - The starting date of the week.
   * @returns An array of dates representing the week.
   */
  getWeek(fromDate: Date) {
    const sunday = new Date(fromDate.setDate(fromDate.getDate() - fromDate.getDay()));
    const result = [new Date(sunday)];

    while (sunday.setDate(sunday.getDate() + 1) && sunday.getDay() !== 0) {
      result.push(new Date(sunday));
    }

    return result;
  }
}


