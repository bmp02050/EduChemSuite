export abstract class BaseModel {
  id?: string; // Use string for GUID in TypeScript
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;

  constructor(
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
    isActive?: boolean
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.isActive = isActive;
  }
}
