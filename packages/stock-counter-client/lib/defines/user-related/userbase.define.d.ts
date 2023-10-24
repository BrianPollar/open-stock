import { User } from '@open-stock/stock-auth-client';
import { DatabaseAuto } from '@open-stock/stock-universal';
/** The  UserBase  class extends another class called  DatabaseAuto . It has properties  user ,  startDate ,  endDate , and  occupation . The  user  property can be either a string or an instance of the  User  class. The  startDate  and  endDate  properties are of type  Date  and represent the start and end dates for the user's occupation. The  occupation  property is a string that represents the user's occupation.  */
export declare abstract class UserBase extends DatabaseAuto {
    /** */
    user: string | User;
    /** */
    startDate: Date;
    /** */
    endDate: Date;
    /** */
    occupation: string;
    /** The  UserBase  class has a constructor that takes a parameter  data . It calls the constructor of the  DatabaseAuto  class with  data  as an argument. It then assigns the  user  property based on the type of  data.user . If  data.user  is a string, it is assigned directly to the  user  property. If it is not a string, it is assumed to be an object that conforms to the  Iuser  interface and is used to create a new instance of the  User  class, which is then assigned to the  user  property. The  startDate  and  endDate  properties are assigned  Date  objects created from  data.startDate  and  data.endDate , respectively. The  occupation  property is assigned the value of  data.occupation .  */
    constructor(data: any);
}
