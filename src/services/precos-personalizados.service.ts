import { request } from "./request";
import type {
  clientesPrecosPersonalizados,
  ClientesPrecosPersonalizadosResponse,
} from "@/models/precos_personalizados.entity";

export const precosPersonalizadosService = {
  async getClientesComPrecosPersonalizados(): Promise<ClientesPrecosPersonalizadosResponse> {
    const response = await request.get("/preco-personalizado");
    console.log(response.data);
    return response.data;
  },

  async getPrecosPersonalizadosPorCliente(
    clienteId: string
  ): Promise<clientesPrecosPersonalizados> {
    const response = await request.get(`/preco-personalizado/${clienteId}`);
    return response.data;
  },

  async createPrecoPersonalizado(data: {
    cliente_id: string;
    precoPersonalizado: Array<{
      produto_id: string;
      preco_revenda: number;
      preco_venda: number;
    }>;
  }): Promise<void> {
    await request.post("/preco-personalizado", data);
  },

  async updatePrecoPersonalizado(
    precoPersonalizadoId: string,
    precoVenda: number,
    precoRevenda: number
  ): Promise<void> {
    await request.put(
      `/preco-personalizado/${precoPersonalizadoId}`,
      {
        preco_venda: precoVenda,
        preco_revenda: precoRevenda,
      }
    );
  },

  async deletePrecoPersonalizado(
    PrecoPersonalizadoId: string
  ): Promise<void> {
    await request.delete(
      `/preco-personalizado/${PrecoPersonalizadoId}`
    );
  },
};
