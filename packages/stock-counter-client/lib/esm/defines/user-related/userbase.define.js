import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto } from '@open-stock/stock-universal';
export class UserBase extends DatabaseAuto {
    constructor(data) {
        super(data);
        this.user = typeof data.user === 'string' ? data.user : new User(data.user);
        this.startDate = new Date(data.startDate);
        this.endDate = new Date(data.endDate);
        this.occupation = data.occupation;
        this.currency = data.currency;
    }
}
//# sourceMappingURL=userbase.define.js.map