export interface clientesPrecosPersonalizados {
  id: string;
  nome: string;
  contato: string;
  endereco: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
  precoPersonalizado: precoPersonalizado[];
}

export interface precoPersonalizado {
  id: string;
  preco_venda: number;
  preco_revenda: number;
  produto: {
    id: string;
    nome: string;
    descricao: string;
    preco_custo: number;
    preco_minimo_venda: number;
    preco_revenda: number;
    categoria: {
      id: string;
      nome: string;
    };
  };
}
export interface ClientesPrecosPersonalizadosResponse {
  clientesPrecosPersonalizados: clientesPrecosPersonalizados[];
  total: number;
}

export interface CreatePrecoPersonalizadoRequest {
  cliente_id: string;
  precoPersonalizado: Array<{
    produto_id: string;
    preco_revenda: number;
    preco_venda: number;
  }>;
}
