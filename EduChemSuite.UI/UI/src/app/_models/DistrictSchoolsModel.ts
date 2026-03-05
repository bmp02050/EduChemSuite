import {UserModel} from "./UserModel";
import {DistrictModel} from "./DistrictModel";
import {SchoolModel} from "./SchoolModel";

export class DistrictSchoolsModel{
  schoolId?: string;
  school?: SchoolModel;
  districtId?: string;
  district?: DistrictModel;
}
