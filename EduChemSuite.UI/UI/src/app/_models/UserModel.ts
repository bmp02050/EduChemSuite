import {AccountType} from "./AccountType";
import {BaseModel} from "./BaseModel";

export class UserModel extends BaseModel{
  firstName?: string;
  lastName?: string;
  email?: string;
  token?: string;
  accountType?: AccountType;
  isAdmin?: boolean;
  verifiedEmail?: boolean;
  showEmail?: boolean;
  preferDarkMode?: boolean;
  password?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  phone?: string;
  questions?: any[];
  exams?: any[];
  examResponses?: any[];
  userSchools?: any[];
  userDistricts?: any[];
}
