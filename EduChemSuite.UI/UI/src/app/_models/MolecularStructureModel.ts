import {BaseModel} from "./BaseModel";
import {UserModel} from "./UserModel";

export class MolecularStructureModel extends BaseModel {
  name?: string;
  graphData?: string;
  imageData?: string;
  userId?: string;
  user?: UserModel;
}
