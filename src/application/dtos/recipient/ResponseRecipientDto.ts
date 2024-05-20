export class RecipientResponseDto {
  id!: string;
  firstName!: string;
  lastName!: string;
  street!: string;
  number!: number;
  cpf!: string;
  complement?: string;
  neighborhood!: string;
  city!: string;
  state!: string;
  zipCode!: string;
  email!: string;
  latitude!: number;
  longitude!: number;
}
