import {BaseModel} from "./BaseModel";
import {UserDistrictModel} from "./UserDistrictModel";
import {DistrictSchoolsModel} from "./DistrictSchoolsModel";

export interface DistrictModel extends BaseModel{

  districtName?: string;
  administrators?: UserDistrictModel[];
  schools?: DistrictSchoolsModel[];
}

