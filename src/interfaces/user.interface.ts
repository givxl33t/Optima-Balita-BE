export interface UserInterface {
  id?: string;
  username: string;
  email: string;
  password?: string;
  profile: string;
}

export interface TokenInterface {
  accessToken: string;
  refreshToken: string;
}
