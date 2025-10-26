import { Role } from "./role.model";

export interface User {
  id?: number;
  username: string;
  roles: Role[];
  department?: string;
  branch?: string;
  year?: number;
  section?: string;
  token?: string;
}
