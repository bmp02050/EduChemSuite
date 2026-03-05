import {AccountType} from "./AccountType";

export class RegisterModel {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  accountType?: AccountType;
  isAdmin?: boolean;
  address1?: string;
  address2?: string;
  address3?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  phone?: string;
}
