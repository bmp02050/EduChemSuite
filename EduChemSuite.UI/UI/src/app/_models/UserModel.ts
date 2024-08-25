import {AccountType} from "./AccountType";
import {BaseModel} from "./BaseModel";

export class UserModel extends BaseModel{
  firstName?: string;
  lastName?: string;
  email?: string;
  token?: string;
  accountType?: AccountType;
}
