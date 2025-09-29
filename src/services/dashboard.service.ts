import { request } from "./request";
import type { StatusVenda } from "@/models/vendas.entity";

interface MetricaComTendencia {
  atual: number;
  anterior: number;
  percentualMudanca: number;
  tendencia: "crescimento" | "queda" | "estavel";
}

export interface DashboardMetrics {
  totalVendas: MetricaComTendencia;
  totalFaturamento: MetricaComTendencia;
  aReceber: MetricaComTendencia;
  recebido: MetricaComTendencia;
  lucro: MetricaComTendencia;
  totalProdutosVendidos: MetricaComTendencia;
  totalClientes: MetricaComTendencia;
  totalProdutos: MetricaComTendencia;
  // Métricas de Performance
  ticketMedio: MetricaComTendencia;
  vendasPorCliente: MetricaComTendencia;
  produtosPorVenda: MetricaComTendencia;
  taxaCancelamento: MetricaComTendencia;

  // Análise de Sazonalidade
  crescimentoMensal: MetricaComTendencia;
  tendenciasSazonais: {
    mes: string;
    vendas: number;
    faturamento: number;
    crescimento: number;
    tendencia: "alta" | "baixa" | "estavel";
  }[];
  previsaoDemanda: {
    proximoMes: {
      vendasPrevistas: number;
      faturamentoPrevisto: number;
      confianca: number;
    };
    tendenciaGeral: "crescimento" | "queda" | "estavel";
    fatoresInfluencia: string[];
  };

  // Métricas de Qualidade
  taxaSatisfacao: MetricaComTendencia;
  produtosMaisDevolvidos: {
    produto: string;
    totalDevolvido: number;
    percentualDevolucao: number;
    valorPerdido: number;
    motivoPrincipal: string;
  }[];
  motivosCancelamento: {
    motivo: string;
    quantidade: number;
    percentual: number;
    valorPerdido: number;
    tendencia: "crescimento" | "queda" | "estavel";
  }[];

  // Métricas de Cliente Avançadas
  lifetimeValue: MetricaComTendencia;
  frequenciaCompra: MetricaComTendencia;
  analiseCoorte: {
    mes: string;
    clientesNovos: number;
    clientesRetidos: number;
    taxaRetencao: number;
    ltvMedio: number;
  }[];
  clientesPorLTV: {
    cliente: string;
    ltv: number;
    totalCompras: number;
    primeiraCompra: string;
    ultimaCompra: string;
    frequenciaCompra: number;
    ticketMedio: number;
  }[];

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
    percentualParticipacao: number;
  }[];
  clientesMaisAtivos: {
    cliente: string;
    totalCompras: number;
    ultimaCompra: string;
  }[];
  clientesMaisAtivosPorValor: {
    cliente: string;
    totalCompras: number;
    ultimaCompra: string;
  }[];
  clientesMaisAtivosPorFrequencia: {
    cliente: string;
    totalCompras: number;
    ultimaCompra: string;
  }[];
  clientesMaisAtivosPorRecencia: {
    cliente: string;
    totalCompras: number;
    ultimaCompra: string;
  }[];
  clientesMaisAtivosPorDiversidade: {
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
        totalVendas: {
          atual: vendas?.total || 0,
          anterior: 0,
          percentualMudanca: 0,
          tendencia: "estavel" as const,
        },
        totalFaturamento: {
          atual: vendas?.totalFaturamento || 0,
          anterior: 0,
          percentualMudanca: 0,
          tendencia: "estavel" as const,
        },
        aReceber: {
          atual: vendas?.totalAReceber || 0,
          anterior: 0,
          percentualMudanca: 0,
          tendencia: "estavel" as const,
        },
        totalClientes: {
          atual: clientes?.total || 0,
          anterior: 0,
          percentualMudanca: 0,
          tendencia: "estavel" as const,
        },
        totalProdutos: {
          atual: produtos?.total || 0,
          anterior: 0,
          percentualMudanca: 0,
          tendencia: "estavel" as const,
        },
        // Métricas de Performance (fallback com valores calculados)
        ticketMedio: {
          atual:
            vendas?.totalFaturamento && vendas?.total
              ? vendas.totalFaturamento / vendas.total
              : 0,
          anterior: 0,
          percentualMudanca: 0,
          tendencia: "estavel" as const,
        },
        vendasPorCliente: {
          atual:
            vendas?.total && clientes?.total
              ? vendas.total / clientes.total
              : 0,
          anterior: 0,
          percentualMudanca: 0,
          tendencia: "estavel" as const,
        },
        produtosPorVenda: {
          atual:
            vendas?.totalProdutosVendidos && vendas?.total
              ? vendas.totalProdutosVendidos / vendas.total
              : 0,
          anterior: 0,
          percentualMudanca: 0,
          tendencia: "estavel" as const,
        },
        taxaCancelamento: {
          atual:
            vendas?.totalCanceladas && vendas?.total
              ? (vendas.totalCanceladas / vendas.total) * 100
              : 0,
          anterior: 0,
          percentualMudanca: 0,
          tendencia: "estavel" as const,
        },

        // Análise de Sazonalidade (fallback)
        crescimentoMensal: {
          atual: 0,
          anterior: 0,
          percentualMudanca: 0,
          tendencia: "estavel" as const,
        },
        tendenciasSazonais: [],
        previsaoDemanda: {
          proximoMes: {
            vendasPrevistas: 0,
            faturamentoPrevisto: 0,
            confianca: 0,
          },
          tendenciaGeral: "estavel" as const,
          fatoresInfluencia: ["Dados insuficientes para análise"],
        },

        // Métricas de Qualidade (fallback)
        taxaSatisfacao: {
          atual: 95, // Simulado
          anterior: 0,
          percentualMudanca: 0,
          tendencia: "estavel" as const,
        },
        produtosMaisDevolvidos: [],
        motivosCancelamento: [],

        // Métricas de Cliente Avançadas (fallback)
        lifetimeValue: {
          atual: 0,
          anterior: 0,
          percentualMudanca: 0,
          tendencia: "estavel" as const,
        },
        frequenciaCompra: {
          atual: 0,
          anterior: 0,
          percentualMudanca: 0,
          tendencia: "estavel" as const,
        },
        analiseCoorte: [],
        clientesPorLTV: [],
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
