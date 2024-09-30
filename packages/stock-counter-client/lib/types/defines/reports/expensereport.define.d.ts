import { DatabaseAuto, IdeleteMany, IexpenseReport, IfilterProps, Isuccess } from '@open-stock/stock-universal';
import { Expense } from '../expense.define';
export declare class ExpenseReport extends DatabaseAuto {
    urId: string;
    companyId: string;
    totalAmount: number;
    date: Date;
    expenses: Expense[];
    readonly currency: string;
    constructor(data: IexpenseReport);
    static getAll(offset?: number, limit?: number): Promise<{
        count: number;
        expensereports: ExpenseReport[];
    }>;
    static filterAll(filter: IfilterProps): Promise<{
        count: number;
        expensereports: ExpenseReport[];
    }>;
    static getOne(urId: string): Promise<ExpenseReport>;
    static add(vals: IexpenseReport): Promise<Isuccess>;
    static removeMany(val: IdeleteMany): Promise<Isuccess>;
    remove(): Promise<Isuccess>;
}
