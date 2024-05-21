export interface CreateRecipientDto {
  email: string;
  cpf: string;
  zipCode: string;
  street?: string;
  number: number;
  complement?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
  firstName: string;
  lastName: string;
  latitude?: number;
  longitude?: number;
}
