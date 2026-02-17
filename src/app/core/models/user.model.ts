import { Role } from "./role.model";

export interface User {
  id?: number;
  username: string;
  password?: string;
  name?: string;
  mobileNumber?: string;
  dateOfBirth?:string;
  gmail?: string;
  roles: Role[];
  department?: string;
  branch?: string;
  year?: number;
  section?: string;
  token?: string;
  active?: boolean;
  firstLogin?: boolean;
}
