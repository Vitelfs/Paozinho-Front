import * as XLSX from "xlsx";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface RelatorioProducaoData {
  dataRelatorio: string;
  dataGeracao: string;
  resumo: {
    totalVendas: number;
    totalItens: number;
    valorTotal: number;
    clientesUnicos: number;
  };
  clientes: Array<{
    nome: string;
    contato: string;
    endereco: string;
    totalVendas: number;
    totalItens: number;
    valorTotal: number;
    vendas: Array<{
      id: string;
      observacoes: string | null;
      itens: Array<{
        produto: {
          nome: string;
          categoria: string;
        };
        quantidade: number;
        precoVenda: number;
        total: number;
      }>;
    }>;
  }>;
}

export function gerarRelatorioProducaoExcel(data: RelatorioProducaoData): void {
  const workbook = XLSX.utils.book_new();

  // Preparar dados em formato similar ao da imagem
  const relatorioData: any[][] = [];
  let currentRow = 0;

  // 🍞 CABEÇALHO PRINCIPAL
  relatorioData.push([
    "🍞 SISTEMA PÃOZINHO - RELATÓRIO DE PRODUÇÃO",
    "",
    "",
    "",
    "",
    "",
  ]);
  currentRow++;

  // Data de Produção
  relatorioData.push([
    `Data de Produção: ${format(new Date(data.dataRelatorio), "dd/MM/yyyy", {
      locale: ptBR,
    })}`,
    "",
    "",
    "",
    "",
    "",
  ]);
  currentRow++;

  // Relatório gerado em
  relatorioData.push([
    `Relatório gerado em: ${format(
      new Date(data.dataGeracao),
      "dd/MM/yyyy, HH:mm:ss",
      { locale: ptBR }
    )}`,
    "",
    "",
    "",
    "",
    "",
  ]);
  currentRow++;

  // Linha em branco
  relatorioData.push(["", "", "", "", "", ""]);
  currentRow++;

  // Para cada cliente
  data.clientes.forEach((cliente) => {
    // HEADER DO CLIENTE com fundo escuro
    relatorioData.push([
      `📋 CLIENTE: ${cliente.nome.toUpperCase()}`,
      "",
      "",
      "",
      "",
      "",
    ]);
    currentRow++;

    // Informações do cliente - uma linha só como na imagem
    const infoCliente = `📞 ${cliente.contato} | 📍 ${cliente.endereco} | 🛒 ${
      cliente.totalVendas
    } venda(s) | 💰 R$ ${cliente.valorTotal.toFixed(2).replace(".", ",")}`;
    relatorioData.push([infoCliente, "", "", "", "", ""]);
    currentRow++;

    // HEADER DA TABELA
    relatorioData.push([
      "Produto",
      "Categoria",
      "Quantidade",
      "Preço Unit.",
      "Total",
      "Observações",
    ]);
    currentRow++;

    // Itens do cliente
    cliente.vendas.forEach((venda) => {
      venda.itens.forEach((item) => {
        relatorioData.push([
          item.produto.nome,
          item.produto.categoria,
          item.quantidade.toString(),
          `R$ ${item.precoVenda.toFixed(2).replace(".", ",")}`,
          `R$ ${item.total.toFixed(2).replace(".", ",")}`,
          venda.observacoes || "-",
        ]);
        currentRow++;
      });
    });

    // Linha em branco entre clientes
    relatorioData.push(["", "", "", "", "", ""]);
    currentRow++;
  });

  // RESUMO FINAL - formato como na imagem
  const resumoTexto = `📊 RESUMO: ${data.resumo.totalVendas} vendas | ${
    data.resumo.totalItens
  } itens | ${
    data.resumo.clientesUnicos
  } clientes únicos | 💰 Total: R$ ${data.resumo.valorTotal
    .toFixed(2)
    .replace(".", ",")}`;
  relatorioData.push([resumoTexto, "", "", "", "", ""]);
  currentRow++;
  
    // Adiciona uma linha em branco antes do resumo de produção
    relatorioData.push(["", "", "", "", "", ""]);
    currentRow++;

  // NOVO: RESUMO PARA PRODUÇÃO
  relatorioData.push(["📦 RESUMO PARA PRODUÇÃO", "", "", "", "", ""]);
  currentRow++;

  // Calcular totais por produto
  const totaisProducao = new Map<string, number>();
  data.clientes.forEach(cliente => {
      cliente.vendas.forEach(venda => {
          venda.itens.forEach(item => {
              const totalAtual = totaisProducao.get(item.produto.nome) || 0;
              totaisProducao.set(item.produto.nome, totalAtual + item.quantidade);
          });
      });
  });

  // Adicionar totais ao relatório
  totaisProducao.forEach((quantidade, nome) => {
      relatorioData.push([`  • ${quantidade} ${nome} no total.`, "", "", "", "", ""]);
      currentRow++;
  });


  // Criar worksheet
  const ws = XLSX.utils.aoa_to_sheet(relatorioData);

  // Configurar larguras das colunas para ficar igual à imagem
  ws["!cols"] = [
    { width: 25 }, // Produto
    { width: 18 }, // Categoria
    { width: 12 }, // Quantidade
    { width: 15 }, // Preço Unit.
    { width: 15 }, // Total
    { width: 35 }, // Observações (mais largo)
  ];

  // Mesclar células para os cabeçalhos (como na imagem)
  const merges = [];

  // Cabeçalho principal (linha 1)
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } });

  // Data de produção (linha 2)
  merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 5 } });

  // Relatório gerado em (linha 3)
  merges.push({ s: { r: 2, c: 0 }, e: { r: 2, c: 5 } });

  // Mesclar linhas de clientes e resumo
  let rowIndex = 4; // Começar após cabeçalho
  data.clientes.forEach((cliente) => {
    // Mesclar linha do nome do cliente
    merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 5 } });
    rowIndex++;

    // Mesclar linha de informações do cliente
    merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 5 } });
    rowIndex++;

    // Pular header da tabela
    rowIndex++;

    // Pular itens do cliente
    cliente.vendas.forEach((venda) => {
      rowIndex += venda.itens.length;
    });

    // Pular linha em branco
    rowIndex++;
  });

  // Mesclar linha de resumo final
  merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 5 } });
  
  // Mesclar linha do cabeçalho de resumo de produção
  rowIndex += 2; // Pula a linha em branco e a linha do resumo geral
  merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 5 } });
  
  // Mesclar linhas do resumo de produção
  totaisProducao.forEach(() => {
    rowIndex++;
    merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 5 } });
  });


  ws["!merges"] = merges;

  // Aplicar cores e estilos às células
  if (!ws["!ref"]) ws["!ref"] = "A1:F1";
  const range = XLSX.utils.decode_range(ws["!ref"]);

  // Aplicar estilos para cada linha
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;

      if (!ws[cellAddress].s) ws[cellAddress].s = {};

      // Cabeçalho principal (linha 1) - Azul forte
      if (R === 0) {
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14 },
          fill: { fgColor: { rgb: "1E3A8A" } }, // Azul escuro
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
      // Data de produção e geração (linhas 2-3) - Cinza claro
      else if (R === 1 || R === 2) {
        ws[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "F3F4F6" } }, // Cinza claro
          alignment: { horizontal: "left", vertical: "center" },
        };
      }
    }
  }

  // Aplicar cores específicas nas seções de cliente
  let currentRowIndex = 4;
  data.clientes.forEach((cliente) => {
    // Header do cliente - Fundo azul escuro
    for (let C = 0; C <= 5; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: currentRowIndex, c: C });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
          fill: { fgColor: { rgb: "374151" } }, // Cinza escuro
          alignment: { horizontal: "left", vertical: "center" },
        };
      }
    }
    currentRowIndex++;

    // Informações do cliente - Fundo vermelho claro
    for (let C = 0; C <= 5; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: currentRowIndex, c: C });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { color: { rgb: "991B1B" } }, // Texto vermelho escuro
          fill: { fgColor: { rgb: "FEE2E2" } }, // Fundo vermelho claro
          alignment: { horizontal: "left", vertical: "center" },
        };
      }
    }
    currentRowIndex++;

    // Header da tabela - Fundo azul médio
    for (let C = 0; C <= 5; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: currentRowIndex, c: C });
      if (ws[cellAddress]) {
        ws[cellAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "3B82F6" } }, // Azul médio
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "000000" } },
            bottom: { style: "thin", color: { rgb: "000000" } },
            left: { style: "thin", color: { rgb: "000000" } },
            right: { style: "thin", color: { rgb: "000000" } },
          },
        };
      }
    }
    currentRowIndex++;

    // Linhas de dados - Zebrado
    cliente.vendas.forEach((venda) => {
      venda.itens.forEach((_, index) => {
        for (let C = 0; C <= 5; C++) {
          const cellAddress = XLSX.utils.encode_cell({
            r: currentRowIndex,
            c: C,
          });
          if (ws[cellAddress]) {
            ws[cellAddress].s = {
              fill: { fgColor: { rgb: index % 2 === 0 ? "FFFFFF" : "F9FAFB" } }, // Zebrado
              alignment: {
                horizontal:
                  C === 2 ? "center" : C >= 3 && C <= 4 ? "right" : "left",
                vertical: "center",
              },
              border: {
                top: { style: "thin", color: { rgb: "E5E7EB" } },
                bottom: { style: "thin", color: { rgb: "E5E7EB" } },
                left: { style: "thin", color: { rgb: "E5E7EB" } },
                right: { style: "thin", color: { rgb: "E5E7EB" } },
              },
            };
          }
        }
        currentRowIndex++;
      });
    });

    currentRowIndex++; // Linha em branco
  });

  // Linha de resumo final - Fundo verde
  for (let C = 0; C <= 5; C++) {
    const cellAddress = XLSX.utils.encode_cell({ r: currentRowIndex, c: C });
    if (ws[cellAddress]) {
      ws[cellAddress].s = {
        font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
        fill: { fgColor: { rgb: "059669" } }, // Verde escuro
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  }

  // Estilo para o cabeçalho do resumo de produção - Laranja
  currentRowIndex += 2;
    for (let C = 0; C <= 5; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: currentRowIndex, c: C });
        if (ws[cellAddress]) {
            ws[cellAddress].s = {
                font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
                fill: { fgColor: { rgb: "F97316" } }, // Laranja
                alignment: { horizontal: "left", vertical: "center" },
            };
        }
    }
    
    // Estilo para as linhas do resumo de produção
    totaisProducao.forEach(() => {
        currentRowIndex++;
        for (let C = 0; C <= 5; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: currentRowIndex, c: C });
            if (ws[cellAddress]) {
                ws[cellAddress].s = {
                    font: { bold: false, color: { rgb: "000000" } },
                    fill: { fgColor: { rgb: "FEF3C7" } }, // Amarelo bem claro
                    alignment: { horizontal: "left", vertical: "center" },
                };
            }
        }
    });


  XLSX.utils.book_append_sheet(workbook, ws, "Relatório de Produção");

  // Gerar e baixar o arquivo
  const fileName = `relatorio-producao-${format(
    new Date(data.dataRelatorio),
    "dd-MM-yyyy"
  )}.xlsx`;

  XLSX.writeFile(workbook, fileName, {
    bookType: "xlsx",
    type: "file",
  });
}

// Função auxiliar para criar resumo de produtos para exibição na tela
export function criarResumoProdutos(data: RelatorioProducaoData) {
  const produtos = new Map<
    string,
    { nome: string; categoria: string; quantidade: number }
  >();

  data.clientes.forEach((cliente) => {
    cliente.vendas.forEach((venda) => {
      venda.itens.forEach((item) => {
        const key = item.produto.nome;
        if (produtos.has(key)) {
          const existing = produtos.get(key)!;
          produtos.set(key, {
            nome: item.produto.nome,
            categoria: item.produto.categoria,
            quantidade: existing.quantidade + item.quantidade,
          });
        } else {
          produtos.set(key, {
            nome: item.produto.nome,
            categoria: item.produto.categoria,
            quantidade: item.quantidade,
          });
        }
      });
    });
  });

  return Array.from(produtos.values()).sort(
    (a, b) => b.quantidade - a.quantidade
  );
}