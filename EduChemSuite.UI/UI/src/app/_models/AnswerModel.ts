import {BaseModel} from "./BaseModel";
import {QuestionModel} from "./QuestionModel";

export class AnswerModel extends BaseModel {
  questionId?: string;
  question?: QuestionModel;
  answerText?: string;
  isCorrect?: boolean;
}
