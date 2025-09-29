export interface ClienteEntity {
  id: string;
  nome: string;
  contato: string;
  endereco: string;
  ativo: boolean;
  createdAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export interface CreateClienteEntity {
  nome: string;
  contato: string;
  endereco: string;
  ativo?: boolean; // Opcional, padrão será true (ativo)
}

export interface UpdateClienteEntity {
  nome?: string;
  contato?: string;
  endereco?: string;
  ativo?: boolean;
}

export interface DeleteClienteEntity {
  id: string;
}

export interface ChangeStatusClienteEntity {
  id: string;
  ativo: boolean;
}
