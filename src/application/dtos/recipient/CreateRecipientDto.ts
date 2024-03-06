export interface CreateRecipientDto {
  name: string;
  email: string;
  cpf: string;
  zipCode: string;
  street?: string;
  number?: number;
  complement?: string;
  city?: string;
  state?: string;
  neighborhood?: string;
}
