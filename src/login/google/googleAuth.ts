export interface GoogleAuthRes {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
  refresh_token: string;
}

export interface RefreshGoogleAuthRes {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export interface UserId {
  email: string;
}
