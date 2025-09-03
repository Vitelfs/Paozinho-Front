

export interface ClienteEntity {
    id: string;
    nome: string;
    contato: string;
    endereco: string;
}

export interface CreateClienteEntity {
    nome: string;
    contato: string;
    endereco: string;
}

export interface UpdateClienteEntity {
    id: string;
    nome?: string;
    contato?: string;
    endereco?: string;
}

export interface DeleteClienteEntity {
    id: string;
}