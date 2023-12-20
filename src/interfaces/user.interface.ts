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
}

export interface MappedUserInterface {
  id?: string;
  username: string;
  email: string;
  profile: string;
  role: string | undefined;
}

export interface TokenInterface {
  accessToken: string;
  refreshToken: string;
}
