import type {
  CreateVendasEntity,
  StatusVenda,
  UpdateVendasEntity,
  VendasResponse,
  ProcessarVendaEntity,
} from "@/models/vendas.entity";
import { request } from "./request";
import type {
  RelatorioVendasPagination,
  VendasPagination,
} from "@/types/pagination.type";

export const vendasService = {
  createVenda: async (venda: CreateVendasEntity) => {
    const response = await request.post("/vendas", venda);
    return response.data;
  },
  updateVenda: async (id: string, venda: UpdateVendasEntity) => {
    const response = await request.put(`/vendas/${id}`, venda);
    return response.data;
  },
  updateStatusVenda: async (id: string, status: StatusVenda) => {
    console.log("status", status);
    console.log("id", id);
    const response = await request.put(`/vendas/${id}/status`, { status });
    return response.data;
  },
  processarVenda: async (id: string, dados: ProcessarVendaEntity) => {
    const response = await request.put(
      `/vendas/${id}/processar-pagamento`,
      dados
    );
    return response.data;
  },
  getRelatorioVendas: async (dados: RelatorioVendasPagination) => {
    console.log("dados", dados);
    const response = await request.get("/vendas/relatorio/producao", {
      params: dados,
    });
    console.log("response", response.data);
    return response.data;
  },
  getRelatorioVendasExcel: async (data_venda: Date) => {
    const response = await request.get("/vendas/relatorio/producao/dados", {
      params: { data_venda },
    });
    return response.data;
  },
  getVendas: async (pagination: VendasPagination): Promise<VendasResponse> => {
    const response = await request.get("/vendas", { params: pagination });
    return response.data;
  },
  getVendaById: async (id: string) => {
    const response = await request.get(`/vendas/${id}`);
    return response.data;
  },
  deleteVenda: async (id: string) => {
    const response = await request.delete(`/vendas/${id}`);
    return response.data;
  },
};
