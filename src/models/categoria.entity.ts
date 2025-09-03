

export interface CategoriaEntity {
    id: string;
    nome: string;
}

export interface CreateCategoriaEntity {
    nome: string;
}

export interface UpdateCategoriaEntity {
    id: string;
    nome?: string;
}

export interface DeleteCategoriaEntity {
    id: string;
}