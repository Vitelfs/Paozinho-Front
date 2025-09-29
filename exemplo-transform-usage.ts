// Exemplo de uso dos schemas com transform no ProdutoPage.tsx
// Este arquivo demonstra diferentes formas de usar o .transform() do Zod

import {
  produtoSchema,
  produtoBackendSchema,
  produtoComPrecoFinalSchema,
  produtoDisplaySchema,
  type ProdutoFormData,
  type ProdutoBackendData,
  type ProdutoComPrecoFinalData,
  type ProdutoDisplayData,
} from "@/schemas/produto.schema";

// Exemplo 1: Validação completa + Transformação para backend
export const exemploValidacaoCompleta = (dadosFormulario: ProdutoFormData) => {
  try {
    // 1. Valida com schema completo (incluindo margem de lucro)
    const dadosValidados = produtoSchema.parse(dadosFormulario);
    console.log("✅ Dados validados:", dadosValidados);

    // 2. Transforma para enviar ao backend (remove margem de lucro)
    const dadosBackend: ProdutoBackendData =
      produtoBackendSchema.parse(dadosValidados);
    console.log("📤 Dados para backend:", dadosBackend);

    return dadosBackend;
  } catch (error) {
    console.error("❌ Erro na validação:", error);
    throw error;
  }
};

// Exemplo 2: Cálculo automático de preço final
export const exemploCalculoPrecoFinal = (dadosFormulario: ProdutoFormData) => {
  try {
    // Valida e calcula preço final automaticamente
    const dadosComPrecoFinal: ProdutoComPrecoFinalData =
      produtoComPrecoFinalSchema.parse(dadosFormulario);
    console.log("💰 Preço final calculado:", dadosComPrecoFinal.preco_final);

    return dadosComPrecoFinal;
  } catch (error) {
    console.error("❌ Erro no cálculo:", error);
    throw error;
  }
};

// Exemplo 3: Formatação para exibição
export const exemploFormatacaoDisplay = (dadosFormulario: ProdutoFormData) => {
  try {
    // Valida e formata para exibição
    const dadosFormatados: ProdutoDisplayData =
      produtoDisplaySchema.parse(dadosFormulario);
    console.log("🎨 Dados formatados:", dadosFormatados);

    return dadosFormatados;
  } catch (error) {
    console.error("❌ Erro na formatação:", error);
    throw error;
  }
};

// Exemplo 4: Uso em uma função de submit real
export const exemploSubmitReal = async (dadosFormulario: ProdutoFormData) => {
  try {
    // 1. Validação completa
    const dadosValidados = produtoSchema.parse(dadosFormulario);

    // 2. Cálculo de preço final (se necessário)
    const dadosComPrecoFinal = produtoComPrecoFinalSchema.parse(dadosValidados);

    // 3. Transformação para backend
    const dadosBackend = produtoBackendSchema.parse(dadosComPrecoFinal);

    // 4. Envio para API
    // await produtoService.createProduto(dadosBackend);

    console.log("✅ Produto criado com sucesso!");
    return dadosBackend;
  } catch (error) {
    console.error("❌ Erro ao criar produto:", error);
    throw error;
  }
};

// Exemplo 5: Validação condicional com transform
export const exemploValidacaoCondicional = (
  dadosFormulario: ProdutoFormData
) => {
  try {
    // Valida com schema base
    const dadosValidados = produtoSchema.parse(dadosFormulario);

    // Transformação condicional baseada no tipo de produto
    if (dadosValidados.margem_lucro > 50) {
      // Produto com alta margem - adiciona flag especial
      return {
        ...dadosValidados,
        tipo_produto: "premium",
        alerta_margem: "Margem de lucro alta detectada",
      };
    } else {
      // Produto padrão
      return {
        ...dadosValidados,
        tipo_produto: "standard",
        alerta_margem: null,
      };
    }
  } catch (error) {
    console.error("❌ Erro na validação condicional:", error);
    throw error;
  }
};

// Dados de exemplo para testar
const dadosExemplo: ProdutoFormData = {
  nome: "Pão Francês",
  categoria_id: "cat-123",
  descricao: "Pão francês tradicional",
  preco_custo: 0.5,
  preco_minimo_venda: 0.8,
  margem_lucro: 60,
  preco_revenda: 1.2,
  margem_lucro_cliente: 50,
};

// Teste dos exemplos
console.log("=== TESTANDO EXEMPLOS ===");
exemploValidacaoCompleta(dadosExemplo);
exemploCalculoPrecoFinal(dadosExemplo);
exemploFormatacaoDisplay(dadosExemplo);
exemploValidacaoCondicional(dadosExemplo);

