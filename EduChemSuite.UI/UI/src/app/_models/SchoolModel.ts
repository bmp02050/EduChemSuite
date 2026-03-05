import {BaseModel} from "./BaseModel";
import {UserModel} from "./UserModel";
import {DistrictModel} from "./DistrictModel";

export class SchoolModel extends BaseModel {
  name?:string;
  staff?: UserModel[];
  students?: UserModel[];
  districtId?: string;
  district?: DistrictModel;
}
