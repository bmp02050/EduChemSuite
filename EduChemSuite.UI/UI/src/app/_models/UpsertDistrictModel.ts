import { BaseModel } from './BaseModel'; // Adjust the import path as needed

export class UpsertDistrictModel extends BaseModel {
  districtName: string;
  userId: string; // Use string for GUID in TypeScript

  constructor(
    districtName: string,
    userId: string,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
    isActive?: boolean
  ) {
    super(id, createdAt, updatedAt, isActive);
    this.districtName = districtName;
    this.userId = userId;
  }
}
