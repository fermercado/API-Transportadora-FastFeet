export interface UserDetails {
  name: string;
  email: string | undefined;
  role: 'admin' | 'deliveryman';
}

export interface AuthResult {
  token: string;
  user: UserDetails;
}

export interface JwtPayload {
  userId: string;
  role: string;
}
