export interface UpdateUserDto {
  cpf?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: 'admin' | 'deliveryman';
  name?: string;
}
