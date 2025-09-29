# 📊 Dashboard Backend - Especificação de Endpoints

Este documento detalha os endpoints e estruturas de dados que o backend precisa implementar para que o dashboard funcione com dados reais.

## 🎯 Endpoint Principal

### `GET /dashboard/metrics`

**Descrição**: Retorna todas as métricas agregadas do dashboard em uma única requisição.

**Parâmetros de Query (opcionais)**:

```typescript
{
  dataInicio?: string; // Formato: YYYY-MM-DD
  dataFim?: string;    // Formato: YYYY-MM-DD
}
```

**Exemplo de requisição**:

```bash
GET /dashboard/metrics?dataInicio=2024-01-01&dataFim=2024-01-31
```

## 📋 Estrutura de Resposta Completa

```typescript
interface DashboardMetrics {
  totalVendas: number; // Total de vendas no período
  totalFaturamento: number; // Soma total em valor monetário
  totalClientes: number; // Quantidade de clientes ativos
  totalProdutos: number; // Quantidade de produtos cadastrados

  // Distribuição de vendas por status
  vendasPorStatus: {
    status: "PENDENTE" | "PRODUZIDO" | "ENTREGUE" | "PAGO" | "CANCELADO";
    count: number; // Quantidade de vendas neste status
    total: number; // Valor total das vendas neste status
  }[];

  // Evolução temporal das vendas
  vendasPorDia: {
    data: string; // Formato: DD/MM ou YYYY-MM-DD
    vendas: number; // Quantidade de vendas no dia
    faturamento: number; // Valor total faturado no dia
  }[];

  // Ranking de produtos mais vendidos
  produtosMaisVendidos: {
    produto: string; // Nome do produto
    quantidade: number; // Quantidade total vendida
    faturamento: number; // Valor total faturado com este produto
  }[];

  // Clientes mais ativos (opcional)
  clientesMaisAtivos: {
    cliente: string; // Nome do cliente
    totalCompras: number; // Quantidade de compras realizadas
    ultimaCompra: string; // Data da última compra (ISO string)
  }[];
}
```

## 📊 Exemplo de Resposta JSON

```json
{
  "totalVendas": 127,
  "totalFaturamento": 4850.5,
  "totalClientes": 45,
  "totalProdutos": 23,

  "vendasPorStatus": [
    {
      "status": "PENDENTE",
      "count": 8,
      "total": 320.0
    },
    {
      "status": "PRODUZIDO",
      "count": 12,
      "total": 480.0
    },
    {
      "status": "ENTREGUE",
      "count": 15,
      "total": 600.0
    },
    {
      "status": "PAGO",
      "count": 85,
      "total": 3200.5
    },
    {
      "status": "CANCELADO",
      "count": 7,
      "total": 250.0
    }
  ],

  "vendasPorDia": [
    {
      "data": "01/01",
      "vendas": 12,
      "faturamento": 450.0
    },
    {
      "data": "02/01",
      "vendas": 8,
      "faturamento": 320.0
    },
    {
      "data": "03/01",
      "vendas": 15,
      "faturamento": 580.0
    }
  ],

  "produtosMaisVendidos": [
    {
      "produto": "Pão Francês",
      "quantidade": 120,
      "faturamento": 360.0
    },
    {
      "produto": "Croissant",
      "quantidade": 85,
      "faturamento": 425.0
    },
    {
      "produto": "Bolo de Chocolate",
      "quantidade": 45,
      "faturamento": 675.0
    }
  ],

  "clientesMaisAtivos": [
    {
      "cliente": "Maria Silva",
      "totalCompras": 15,
      "ultimaCompra": "2024-01-15T10:30:00Z"
    },
    {
      "cliente": "João Santos",
      "totalCompras": 12,
      "ultimaCompra": "2024-01-14T16:45:00Z"
    }
  ]
}
```

## 🔄 Sistema de Fallback

Caso o endpoint `/dashboard/metrics` não esteja disponível, o frontend usa um sistema de fallback que combina os endpoints existentes:

### Endpoints Utilizados no Fallback:

1. **`GET /vendas`** - Para métricas de vendas

   ```typescript
   // Resposta esperada (já existe):
   {
     vendas: VendasEntity[];
     total: number;
     totalPagas: number;
     totalPendentes: number;
     totalCanceladas: number;
     totalEntregues: number;
     totalProduzidas: number;
     totalFaturamento: number;
   }
   ```

2. **`GET /cliente`** - Para total de clientes

   ```typescript
   // Resposta esperada (já existe):
   {
     clientes: ClienteEntity[];
     total: number;
   }
   ```

3. **`GET /produto`** - Para total de produtos
   ```typescript
   // Resposta esperada (já existe):
   {
     produtos: ProdutoEntity[];
     total: number;
   }
   ```

## ⚡ Otimizações Recomendadas

### 1. Cache

- Implementar cache Redis para métricas com TTL de 5-15 minutos
- Invalidar cache quando houver alterações relevantes

### 2. Consultas Eficientes

```sql
-- Exemplo de query otimizada para vendas por status
SELECT
  status,
  COUNT(*) as count,
  SUM(total) as total
FROM vendas
WHERE data_venda BETWEEN ? AND ?
GROUP BY status;

-- Exemplo para produtos mais vendidos
SELECT
  p.nome as produto,
  SUM(iv.quantidade) as quantidade,
  SUM(iv.quantidade * iv.preco_venda) as faturamento
FROM item_venda iv
JOIN produto p ON iv.produto_id = p.id
JOIN vendas v ON iv.venda_id = v.id
WHERE v.data_venda BETWEEN ? AND ?
GROUP BY p.id, p.nome
ORDER BY quantidade DESC
LIMIT 10;
```

### 3. Índices Recomendados

```sql
-- Índices para melhor performance
CREATE INDEX idx_vendas_data_status ON vendas(data_venda, status);
CREATE INDEX idx_vendas_data_venda ON vendas(data_venda);
CREATE INDEX idx_item_venda_produto ON item_venda(produto_id);
```

## 🚀 Implementação Sugerida

### Controller (Node.js/Express exemplo)

```javascript
// GET /dashboard/metrics
exports.getDashboardMetrics = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;

    // Definir período padrão se não fornecido
    const endDate = dataFim ? new Date(dataFim) : new Date();
    const startDate = dataInicio
      ? new Date(dataInicio)
      : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 dias atrás

    const metrics = await dashboardService.getMetrics(startDate, endDate);

    res.json(metrics);
  } catch (error) {
    console.error("Erro ao buscar métricas:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
```

### Service (exemplo)

```javascript
exports.getMetrics = async (startDate, endDate) => {
  const [
    vendas,
    vendasPorStatus,
    vendasPorDia,
    produtosMaisVendidos,
    totalClientes,
    totalProdutos,
    clientesMaisAtivos,
  ] = await Promise.all([
    getVendasTotals(startDate, endDate),
    getVendasPorStatus(startDate, endDate),
    getVendasPorDia(startDate, endDate),
    getProdutosMaisVendidos(startDate, endDate),
    getTotalClientes(),
    getTotalProdutos(),
    getClientesMaisAtivos(startDate, endDate),
  ]);

  return {
    totalVendas: vendas.count,
    totalFaturamento: vendas.total,
    totalClientes,
    totalProdutos,
    vendasPorStatus,
    vendasPorDia,
    produtosMaisVendidos,
    clientesMaisAtivos,
  };
};
```

## 📝 Notas Importantes

1. **Formato de Datas**: O frontend envia datas no formato `YYYY-MM-DD` e espera receber no formato `DD/MM` para os gráficos.

2. **Status de Vendas**: Os status devem ser exatamente:

   - `PENDENTE` (amarelo)
   - `PRODUZIDO` (azul)
   - `ENTREGUE` (roxo)
   - `PAGO` (verde)
   - `CANCELADO` (vermelho)

3. **Valores Monetários**: Sempre em formato numérico (não string), o frontend faz a formatação.

4. **Limite de Registros**: Para `produtosMaisVendidos` e `clientesMaisAtivos`, retornar no máximo 10 registros.

5. **Performance**: O endpoint deve responder em menos de 2 segundos para uma boa UX.

## 🧪 Testes

Para testar o endpoint, você pode usar dados mockados inicialmente:

```bash
# Teste básico
curl -X GET "http://localhost:3000/dashboard/metrics"

# Teste com filtros
curl -X GET "http://localhost:3000/dashboard/metrics?dataInicio=2024-01-01&dataFim=2024-01-31"
```

---

**Status**: ✅ Frontend implementado e funcionando com dados mockados  
**Próximo passo**: Implementar o endpoint `/dashboard/metrics` no backend conforme esta especificação.
