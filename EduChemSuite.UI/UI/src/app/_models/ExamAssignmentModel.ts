import {BaseModel} from "./BaseModel";
import {ExamModel} from "./ExamModel";
import {UserModel} from "./UserModel";

export class ExamAssignmentModel extends BaseModel {
  examId?: string;
  exam?: ExamModel;
  userId?: string;
  user?: UserModel;
  assignedAt?: Date;
}
