import { ItrackEdit, Iuser, IuserActionTrack } from '../../interfaces/general.interface';
import { DatabaseAuto } from '../base.define';

export class TrackEdit
  extends DatabaseAuto {
  parent: string;
  createdBy: Iuser;
  users: IuserActionTrack[];
  deletedBy: Iuser;

  constructor(data: ItrackEdit) {
    super(data);
    this.parent = data.parent;
    this.createdBy = data.createdBy as Iuser;
    this.users = data.users;
    this.deletedBy = data.deletedBy as Iuser;
  }
}
