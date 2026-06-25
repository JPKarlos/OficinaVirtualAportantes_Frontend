export interface User {
  id: string;
  nombre: string;
  email: string;
  phoneNumber: string;
  IDE_PRESTADOR: number;
  Aportante_id: number;
  roles?: Role[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
}
