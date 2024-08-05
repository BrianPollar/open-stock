import { IuserActionTrack } from '../../interfaces/general.interface';
import { DatabaseAuto } from '../base.define';

export class ItrackView
  extends DatabaseAuto {
  parent: string;
  users: IuserActionTrack[];

  constructor(data) {
    super(data);
    this.parent = data.parent;
    this.users = data.users;
  }
}
