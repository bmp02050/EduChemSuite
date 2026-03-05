import {BaseModel} from "./BaseModel";
import {TagModel} from "./TagModel";

export class QuestionTagModel extends BaseModel {
  questionId?: string;
  tagId?: string;
  tag?: TagModel;
}
