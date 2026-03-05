import {BaseModel} from "./BaseModel";
import {ExamQuestionModel} from "./ExamQuestionModel";
import {GradeModel} from "./GradeModel";

export class ExamModel extends BaseModel {
  name?: string;
  description?: string;
  timeLimitMinutes?: number | null;
  allowRetakes?: boolean;
  maxAttempts?: number;
  isTest?: boolean;
  strictDiagramGrading?: boolean;
  examQuestions?: ExamQuestionModel[];
  grades?: GradeModel[];
}
