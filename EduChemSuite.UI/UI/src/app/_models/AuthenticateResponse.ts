export class AuthenticateResponse{
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  accountType?: number;
  accessToken?: string;
  refreshToken?: string;
  preferDarkMode?: boolean;
  success?: boolean;
}
