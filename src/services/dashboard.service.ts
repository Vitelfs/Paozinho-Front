import { request } from "./request";
import type { StatusVenda } from "@/models/vendas.entity";

export interface DashboardMetrics {
  totalVendas: number;
  totalFaturamento: number;
  aReceber: number;
  totalClientes: number;
  totalProdutos: number;
  vendasPorStatus: {
    status: StatusVenda;
    count: number;
    total: number;
  }[];
  vendasPorDia: {
    data: string;
    vendas: number;
    faturamento: number;
  }[];
  produtosMaisVendidos: {
    produto: string;
    quantidade: number;
    faturamento: number;
  }[];
  clientesMaisAtivos: {
    cliente: string;
    totalCompras: number;
    ultimaCompra: string;
  }[];
}

export const dashboardService = {
  getMetrics: async (
    dataInicio?: string,
    dataFim?: string
  ): Promise<DashboardMetrics> => {
    const params: Record<string, string> = {};
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;

    const response = await request.get("/dashboard/metrics", { params });
    console.log("response", response.data);
    return response.data;
  },

  // Fallback usando os serviços existentes caso não tenha endpoint dedicado
  getMetricsFallback: async (): Promise<Partial<DashboardMetrics>> => {
    try {
      // Buscar dados básicos usando serviços existentes
      const [vendasData, clientesData, produtosData] = await Promise.allSettled(
        [
          request.get("/vendas", { params: { limit: 1000 } }),
          request.get("/cliente", { params: { limit: 1000 } }),
          request.get("/produto", { params: { limit: 1000 } }),
        ]
      );

      const vendas =
        vendasData.status === "fulfilled" ? vendasData.value.data : null;
      const clientes =
        clientesData.status === "fulfilled" ? clientesData.value.data : null;
      const produtos =
        produtosData.status === "fulfilled" ? produtosData.value.data : null;

      return {
        totalVendas: vendas?.total || 0,
        totalFaturamento: vendas?.totalFaturamento || 0,
        totalClientes: clientes?.total || 0,
        totalProdutos: produtos?.total || 0,
        vendasPorStatus: vendas
          ? [
              {
                status: "PENDENTE" as StatusVenda,
                count: vendas.totalPendentes || 0,
                total: 0,
              },
              {
                status: "PRODUZIDO" as StatusVenda,
                count: vendas.totalProduzidas || 0,
                total: 0,
              },
              {
                status: "ENTREGUE" as StatusVenda,
                count: vendas.totalEntregues || 0,
                total: 0,
              },
              {
                status: "PAGO" as StatusVenda,
                count: vendas.totalPagas || 0,
                total: 0,
              },
              {
                status: "CANCELADO" as StatusVenda,
                count: vendas.totalCanceladas || 0,
                total: 0,
              },
            ]
          : [],
      };
    } catch (error) {
      console.error("Erro ao buscar métricas:", error);
      return {};
    }
  },
};
