import {BaseModel} from "./BaseModel";
import {UserModel} from "./UserModel";
import {QuestionModel} from "./QuestionModel";
import {AnswerModel} from "./AnswerModel";

export class ExamResponseModel extends BaseModel {
  examId?: string;
  userId?: string;
  user?: UserModel;
  questionId?: string;
  question?: QuestionModel;
  answerId?: string;
  answer?: AnswerModel;
  responseText?: string;
  responseImage?: string;
  imageTypeId?: string;
  isCorrect?: boolean | null;
  isGraded?: boolean;
}
