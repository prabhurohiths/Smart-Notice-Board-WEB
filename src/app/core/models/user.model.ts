import { Role } from "./role.model";

export interface User {
  id?: number;
  username: string;
  name?: string;
  mobileNumber?: string;
  gmail?: string;
  roles: Role[];
  department?: string;
  branch?: string;
  year?: number;
  section?: string;
  token?: string;
}
