import {UserModel} from "./UserModel";
import {SchoolModel} from "./SchoolModel";

export class UserSchoolModel {
  userId?: string;
  user?: UserModel;
  schoolId?: string;
  school?: SchoolModel;
}
