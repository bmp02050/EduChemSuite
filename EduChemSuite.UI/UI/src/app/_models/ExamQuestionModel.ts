import {BaseModel} from "./BaseModel";
import {QuestionModel} from "./QuestionModel";

export class ExamQuestionModel extends BaseModel {
  examId?: string;
  questionId?: string;
  question?: QuestionModel;
  angleTolerancePercent?: number | null;
}
