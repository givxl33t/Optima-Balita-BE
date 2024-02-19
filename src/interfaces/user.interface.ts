import { MetaInterface } from "./pagination.interface";

export interface RoleInterface {
  id?: string;
  name: string;
}

export interface UserInterface {
  id?: string;
  username: string;
  email: string;
  password?: string;
  profile: string;
  roles?: RoleInterface[];
  created_at?: Date;
}

export interface MappedUserInterface {
  id?: string;
  username: string;
  email: string;
  profile: string;
  role: string | undefined;
  created_at?: Date;
}

export interface TokenInterface {
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedUserInterface {
  meta: MetaInterface | undefined;
  rows: MappedUserInterface[];
}
