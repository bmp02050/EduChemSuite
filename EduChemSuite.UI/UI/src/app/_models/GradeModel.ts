import {BaseModel} from "./BaseModel";
import {UserModel} from "./UserModel";

export class GradeModel extends BaseModel {
  userId?: string;
  user?: UserModel;
  examId?: string;
  gradeValue?: number;
  gradingStatus?: number;
}
