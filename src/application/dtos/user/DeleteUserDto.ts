export interface DeleteUserDto {
  id: string;
  loggedInUserId: string;
  providedDeleteKey?: string;
}
