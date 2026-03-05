import {BaseModel} from "./BaseModel";
import {UserModel} from "./UserModel";
import {QuestionTypeModel} from "./QuestionTypeModel";
import {QuestionTagModel} from "./QuestionTagModel";
import {AnswerModel} from "./AnswerModel";

export class QuestionModel extends BaseModel {
  userId?: string;
  user?: UserModel;
  questionText?: string;
  questionTypeId?: string;
  questionType?: QuestionTypeModel;
  questionTags?: QuestionTagModel[];
  answers?: AnswerModel[];
  version?: number;
}
