import { useState, useEffect, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Package,
  Plus,
  DollarSign,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { produtoService } from "@/services/produto.service";
import { precosPersonalizadosService } from "@/services/precos-personalizados.service";
import {
  updatePrecoPersonalizadoSchema,
  createPrecoPersonalizadoSchema,
} from "@/schemas/precos-personalizados.schema";
import type {
  clientesPrecosPersonalizados,
  precoPersonalizado,
} from "@/models/precos_personalizados.entity";

interface ProdutoSemPrecoPersonalizado {
  id: string;
  nome: string;
  descricao: string;
  preco_custo: number;
  preco_minimo_venda: number;
  preco_revenda: number;
  margem_lucro: number;
  margem_lucro_cliente: number;
  createdAt: string;
  updatedAt: string;
  categoria_id: string;
}

interface DragDropProdutosProps {
  cliente: clientesPrecosPersonalizados;
  onUpdate: () => void;
}

interface ProdutoItemProps {
  produto: ProdutoSemPrecoPersonalizado;
  isDragOverlay?: boolean;
  cliente: clientesPrecosPersonalizados;
  onUpdate: () => void;
  loadProdutosSemPreco: () => Promise<void>;
  loadPrecosPersonalizados: () => Promise<void>;
}

interface PrecoPersonalizadoItemProps {
  precoPersonalizado: precoPersonalizado;
  isDragOverlay?: boolean;
  onUpdate: () => void;
  loadProdutosSemPreco: () => Promise<void>;
  loadPrecosPersonalizados: () => Promise<void>;
}

// Componente Droppable para área de preços personalizados
function DroppableArea({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "precos-personalizados",
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-2 min-h-[200px] transition-colors ${
        isOver ? "bg-green-50 dark:bg-green-900/20" : ""
      }`}
    >
      {children}
    </div>
  );
}

// Componente Droppable para área de produtos disponíveis
function DroppableProdutosArea({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "produtos-disponiveis",
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-2 min-h-[200px] transition-colors ${
        isOver ? "bg-blue-50 dark:bg-blue-900/20" : ""
      }`}
    >
      {children}
    </div>
  );
}

// Componente para produto sem preço personalizado
function ProdutoItem({
  produto,
  isDragOverlay = false,
  cliente,
  onUpdate,
  loadProdutosSemPreco,
  loadPrecosPersonalizados,
}: ProdutoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: produto.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAddToPersonalized = async () => {
    try {
      // Validação com Zod
      const validationResult = createPrecoPersonalizadoSchema.safeParse({
        cliente_id: cliente.id,
        precoPersonalizado: [
          {
            produto_id: produto.id,
            preco_revenda: produto.preco_revenda,
            preco_venda: produto.preco_minimo_venda,
          },
        ],
      });

      if (!validationResult.success) {
        // Mostrar primeiro erro encontrado
        const firstError = validationResult.error.issues[0];
        toast.error(firstError.message);
        return;
      }

      await precosPersonalizadosService.createPrecoPersonalizado({
        cliente_id: cliente.id,
        precoPersonalizado: [
          {
            produto_id: produto.id,
            preco_revenda: produto.preco_revenda,
            preco_venda: produto.preco_minimo_venda,
          },
        ],
      });
      toast.success("Produto adicionado aos preços personalizados");
      // Recarregar dados
      await Promise.all([loadProdutosSemPreco(), loadPrecosPersonalizados()]);
      onUpdate();
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      toast.error("Erro ao adicionar produto");
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 border rounded-lg cursor-grab hover:shadow-md transition-shadow ${
        isDragOverlay
          ? "shadow-lg bg-white dark:bg-gray-800"
          : "bg-white dark:bg-gray-800"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium text-sm">{produto.nome}</h4>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToPersonalized();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="h-6 w-6 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <Badge variant="secondary" className="text-xs">
          Venda: R$ {produto.preco_minimo_venda.toFixed(2).replace(".", ",")}
        </Badge>
        <Badge variant="outline" className="text-xs">
          Revenda: R$ {produto.preco_revenda.toFixed(2).replace(".", ",")}
        </Badge>
      </div>
    </div>
  );
}

// Componente para preço personalizado
function PrecoPersonalizadoItem({
  precoPersonalizado,
  isDragOverlay = false,
  onUpdate,
  loadProdutosSemPreco,
  loadPrecosPersonalizados,
}: PrecoPersonalizadoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [precoVenda, setPrecoVenda] = useState(
    precoPersonalizado.preco_venda.toFixed(2).replace(".", ",")
  );
  const [precoRevenda, setPrecoRevenda] = useState(
    precoPersonalizado.preco_revenda.toFixed(2).replace(".", ",")
  );

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: precoPersonalizado.id,
    disabled: isEditing, // Desabilita drag quando em modo de edição
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = async () => {
    try {
      const precoVendaNumerico = parseFloat(precoVenda.replace(",", "."));
      const precoRevendaNumerico = parseFloat(precoRevenda.replace(",", "."));

      // Validação com Zod
      const validationResult = updatePrecoPersonalizadoSchema.safeParse({
        preco_venda: precoVendaNumerico,
        preco_revenda: precoRevendaNumerico,
      });

      if (!validationResult.success) {
        // Mostrar primeiro erro encontrado
        const firstError = validationResult.error.issues[0];
        toast.error(firstError.message);
        return;
      }

      await precosPersonalizadosService.updatePrecoPersonalizado(
        precoPersonalizado.id,
        precoVendaNumerico,
        precoRevendaNumerico
      );

      setIsEditing(false);
      toast.success("Preços atualizados com sucesso");
      await Promise.all([loadProdutosSemPreco(), loadPrecosPersonalizados()]);
      onUpdate();
    } catch (error) {
      console.error("Erro ao atualizar preços:", error);
      toast.error("Erro ao atualizar preços");
    }
  };

  const handleDelete = async () => {
    try {
      await precosPersonalizadosService.deletePrecoPersonalizado(
        precoPersonalizado.id
      );
      toast.success("Preço personalizado removido");
      await Promise.all([loadProdutosSemPreco(), loadPrecosPersonalizados()]);
      onUpdate();
    } catch (error) {
      console.error("Erro ao remover preço:", error);
      toast.error("Erro ao remover preço personalizado");
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isEditing ? {} : attributes)} // Só aplica atributos de drag quando não está editando
      {...(isEditing ? {} : listeners)} // Só aplica listeners de drag quando não está editando
      className={`p-3 border rounded-lg transition-shadow ${
        isEditing
          ? "cursor-default bg-white dark:bg-gray-800" // Cursor normal quando editando
          : isDragOverlay
          ? "cursor-grab shadow-lg bg-white dark:bg-gray-800 hover:shadow-md"
          : "cursor-grab bg-white dark:bg-gray-800 hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          <h4 className="font-medium text-sm">
            {precoPersonalizado.produto.nome}
          </h4>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(!isEditing);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="h-6 w-6 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="preco-venda" className="text-xs">
              Venda R$
            </Label>
            <Input
              id="preco-venda"
              type="text"
              value={precoVenda}
              onChange={(e) => setPrecoVenda(e.target.value)}
              className="h-6 text-xs"
              placeholder="0,00"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="preco-revenda" className="text-xs">
              Revenda R$
            </Label>
            <Input
              id="preco-revenda"
              type="text"
              value={precoRevenda}
              onChange={(e) => setPrecoRevenda(e.target.value)}
              className="h-6 text-xs"
              placeholder="0,00"
            />
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="h-6 text-xs"
            >
              Salvar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(false);
                setPrecoVenda(
                  precoPersonalizado.preco_venda.toFixed(2).replace(".", ",")
                );
                setPrecoRevenda(
                  precoPersonalizado.preco_revenda.toFixed(2).replace(".", ",")
                );
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="h-6 text-xs"
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              Venda Original: R${" "}
              {precoPersonalizado.produto.preco_minimo_venda
                .toFixed(2)
                .replace(".", ",")}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Revenda Original: R${" "}
              {precoPersonalizado.preco_revenda.toFixed(2).replace(".", ",")}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">
              Venda Personalizada: R${" "}
              {precoPersonalizado.preco_venda.toFixed(2).replace(".", ",")}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Revenda Personalizada: R${" "}
              {precoPersonalizado.preco_revenda.toFixed(2).replace(".", ",")}
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de paginação
function PaginationControls({
  pagination,
  onPageChange,
  loading,
}: {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
    itemsPerPage: number;
  };
  onPageChange: (page: number) => void;
  loading: boolean;
}) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t">
      <div className="text-sm text-muted-foreground">
      Mostrando {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}{" "}
          a{" "}
          {Math.min(
            pagination.currentPage * pagination.itemsPerPage,
            pagination.totalItems
          )}{" "}
          de {pagination.totalItems} itens
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrev || loading}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm">
          Página {pagination.currentPage} de {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNext || loading}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function DragDropProdutos({ cliente, onUpdate }: DragDropProdutosProps) {
  const [produtosSemPreco, setProdutosSemPreco] = useState<
    ProdutoSemPrecoPersonalizado[]
  >([]);
  const [precosPersonalizados, setPrecosPersonalizados] = useState<
    precoPersonalizado[]
  >([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de paginação para produtos disponíveis
  const [produtosPage, setProdutosPage] = useState(1);
  const [produtosTotal, setProdutosTotal] = useState(0);
  const [produtosLoading, setProdutosLoading] = useState(false);

  // Estados de paginação para preços personalizados
  const [precosPage, setPrecosPage] = useState(1);
  const [precosTotal, setPrecosTotal] = useState(0);
  const [precosLoading, setPrecosLoading] = useState(false);

  const ITEMS_PER_PAGE = 5;

  // Estado global de busca
  const [searchTerm, setSearchTerm] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const loadProdutosSemPreco = useCallback(async () => {
    try {
      setProdutosLoading(true);
      const idsComPreco = cliente.precoPersonalizado.map((p) => p.produto.id);
      const response =
        await produtoService.getProdutosWithoutPrecosPersonalizados(
          idsComPreco,
          {
            limit: ITEMS_PER_PAGE,
            offset: (produtosPage - 1) * ITEMS_PER_PAGE,
            nome: searchTerm || undefined,
          }
        );
      setProdutosSemPreco(response.produtos || []);
      setProdutosTotal(response.total || 0);
    } catch (error) {
      console.error("Erro ao carregar produtos sem preço:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setProdutosLoading(false);
    }
  }, [cliente.precoPersonalizado, produtosPage, searchTerm, ITEMS_PER_PAGE]);

  const loadPrecosPersonalizados = useCallback(async () => {
    try {
      setPrecosLoading(true);
      // Filtrar preços personalizados localmente por busca
      let filteredPrecos = cliente.precoPersonalizado;

      if (searchTerm) {
        filteredPrecos = cliente.precoPersonalizado.filter(
          (preco) =>
            preco.produto.nome
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            preco.produto.descricao
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
      }

      // Aplicar paginação local
      const startIndex = (precosPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const paginatedPrecos = filteredPrecos.slice(startIndex, endIndex);

      setPrecosPersonalizados(paginatedPrecos);
      setPrecosTotal(filteredPrecos.length);
    } catch (error) {
      console.error("Erro ao carregar preços personalizados:", error);
      toast.error("Erro ao carregar preços personalizados");
    } finally {
      setPrecosLoading(false);
    }
  }, [cliente.precoPersonalizado, precosPage, searchTerm, ITEMS_PER_PAGE]);

  // Carregamento inicial
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadProdutosSemPreco(), loadPrecosPersonalizados()]);
      setLoading(false);
    };
    loadData();
  }, []); // Apenas no mount inicial

  // Recarregar quando valores mudarem
  useEffect(() => {
    loadProdutosSemPreco();
  }, [searchTerm, produtosPage]);

  useEffect(() => {
    loadPrecosPersonalizados();
  }, [searchTerm, precosPage]);

  // Handler para busca global
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setProdutosPage(1); // Reset para primeira página
    setPrecosPage(1); // Reset para primeira página
  }, []);

  // Handlers para paginação
  const handleProdutosPageChange = useCallback((page: number) => {
    setProdutosPage(page);
  }, []);

  const handlePrecosPageChange = useCallback((page: number) => {
    setPrecosPage(page);
  }, []);

  // Calcular informações de paginação
  const produtosPagination = useMemo(
    () => ({
      currentPage: produtosPage,
      totalPages: Math.ceil(produtosTotal / ITEMS_PER_PAGE),
      totalItems: produtosTotal,
      itemsPerPage: ITEMS_PER_PAGE,
      hasNext: produtosPage < Math.ceil(produtosTotal / ITEMS_PER_PAGE),
      hasPrev: produtosPage > 1,
    }),
    [produtosPage, produtosTotal, ITEMS_PER_PAGE]
  );

  const precosPagination = useMemo(
    () => ({
      currentPage: precosPage,
      totalPages: Math.ceil(precosTotal / ITEMS_PER_PAGE),
      totalItems: precosTotal,
      itemsPerPage: ITEMS_PER_PAGE,
      hasNext: precosPage < Math.ceil(precosTotal / ITEMS_PER_PAGE),
      hasPrev: precosPage > 1,
    }),
    [precosPage, precosTotal, ITEMS_PER_PAGE]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Implementar lógica de drag over se necessário
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Se arrastando produto sem preço para área de preços personalizados
    if (
      produtosSemPreco.some((p) => p.id === activeId) &&
      overId === "precos-personalizados"
    ) {
      const produto = produtosSemPreco.find((p) => p.id === activeId);
      if (produto) {
        // Criar novo preço personalizado
        try {
          await precosPersonalizadosService.createPrecoPersonalizado({
            cliente_id: cliente.id,
            precoPersonalizado: [
              {
                produto_id: produto.id,
                preco_venda: produto.preco_minimo_venda,
                preco_revenda: produto.preco_revenda,
              },
            ],
          });

          // Remover produto da lista sem preço
          setProdutosSemPreco((prev) => prev.filter((p) => p.id !== activeId));
          toast.success("Produto adicionado aos preços personalizados");
          onUpdate();

          // Recarregar listas após operação
          await Promise.all([
            loadProdutosSemPreco(),
            loadPrecosPersonalizados(),
          ]);
        } catch (error) {
          console.error("Erro ao criar preço personalizado:", error);
          toast.error("Erro ao adicionar produto");
        }
      }
    }

    // Se arrastando preço personalizado de volta para produtos disponíveis
    if (
      precosPersonalizados.some((p) => p.id === activeId) &&
      overId === "produtos-disponiveis"
    ) {
      const precoPersonalizado = precosPersonalizados.find(
        (p) => p.id === activeId
      );
      if (precoPersonalizado) {
        try {
          await precosPersonalizadosService.deletePrecoPersonalizado(
            precoPersonalizado.id
          );

          // Remover da lista de preços personalizados
          setPrecosPersonalizados((prev) =>
            prev.filter((p) => p.id !== activeId)
          );

          // Adicionar produto de volta à lista de produtos disponíveis
          const produtoOriginal = {
            id: precoPersonalizado.produto.id,
            nome: precoPersonalizado.produto.nome,
            descricao: precoPersonalizado.produto.descricao,
            preco_custo: 0, // Valores padrão, serão atualizados quando recarregar
            preco_minimo_venda: precoPersonalizado.preco_venda,
            preco_revenda: precoPersonalizado.preco_revenda,
            margem_lucro: 0,
            margem_lucro_cliente: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            categoria_id: precoPersonalizado.produto.categoria.id,
          };

          setProdutosSemPreco((prev) => [...prev, produtoOriginal]);
          toast.success("Preço personalizado removido");
          onUpdate();

          // Recarregar listas após operação
          await Promise.all([
            loadProdutosSemPreco(),
            loadPrecosPersonalizados(),
          ]);
        } catch (error) {
          console.error("Erro ao remover preço personalizado:", error);
          toast.error("Erro ao remover preço personalizado");
        }
      }
    }
  };

  const activeProduto = produtosSemPreco.find((p) => p.id === activeId);
  const activePrecoPersonalizado = precosPersonalizados.find(
    (p) => p.id === activeId
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de busca global */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar produtos..."
            className="pl-10"
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Produtos sem preço personalizado */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5" />
                Produtos Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SortableContext
                items={produtosSemPreco.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <DroppableProdutosArea>
                  {produtosLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm">Carregando produtos...</p>
                    </div>
                  ) : produtosSemPreco.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">
                        {searchTerm
                          ? "Nenhum produto encontrado"
                          : "Todos os produtos já têm preços personalizados"}
                      </p>
                    </div>
                  ) : (
                    produtosSemPreco.map((produto) => (
                      <ProdutoItem
                        key={produto.id}
                        produto={produto}
                        cliente={cliente}
                        onUpdate={onUpdate}
                        loadProdutosSemPreco={loadProdutosSemPreco}
                        loadPrecosPersonalizados={loadPrecosPersonalizados}
                      />
                    ))
                  )}
                </DroppableProdutosArea>
              </SortableContext>
              <PaginationControls
                pagination={produtosPagination}
                onPageChange={handleProdutosPageChange}
                loading={produtosLoading}
              />
            </CardContent>
          </Card>

          {/* Preços personalizados */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
                Preços Personalizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SortableContext
                id="precos-personalizados"
                items={precosPersonalizados.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <DroppableArea>
                  {precosLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm">Carregando preços...</p>
                    </div>
                  ) : precosPersonalizados.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <Plus className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">
                        {searchTerm
                          ? "Nenhum preço encontrado"
                          : "Arraste produtos aqui para criar preços personalizados"}
                      </p>
                    </div>
                  ) : (
                    precosPersonalizados.map((precoPersonalizado) => (
                      <PrecoPersonalizadoItem
                        key={precoPersonalizado.id}
                        precoPersonalizado={precoPersonalizado}
                        onUpdate={onUpdate}
                        loadProdutosSemPreco={loadProdutosSemPreco}
                        loadPrecosPersonalizados={loadPrecosPersonalizados}
                      />
                    ))
                  )}
                </DroppableArea>
              </SortableContext>
              <PaginationControls
                pagination={precosPagination}
                onPageChange={handlePrecosPageChange}
                loading={precosLoading}
              />
            </CardContent>
          </Card>
        </div>

        <DragOverlay>
          {activeId ? (
            activeProduto ? (
              <div className="p-3 border rounded-lg shadow-lg bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium text-sm">
                      {activeProduto.nome}
                    </h4>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    Venda: R${" "}
                    {activeProduto.preco_minimo_venda
                      .toFixed(2)
                      .replace(".", ",")}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Revenda: R${" "}
                    {activeProduto.preco_revenda.toFixed(2).replace(".", ",")}
                  </Badge>
                </div>
              </div>
            ) : activePrecoPersonalizado ? (
              <div className="p-3 border rounded-lg shadow-lg bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-sm">
                      {activePrecoPersonalizado.produto.nome}
                    </h4>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    Venda Original: R${" "}
                    {activePrecoPersonalizado.produto.preco_minimo_venda
                      .toFixed(2)
                      .replace(".", ",")}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Revenda Original: R${" "}
                    {activePrecoPersonalizado.preco_revenda
                      .toFixed(2)
                      .replace(".", ",")}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    Venda Personalizada: R${" "}
                    {activePrecoPersonalizado.preco_venda
                      .toFixed(2)
                      .replace(".", ",")}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Revenda Personalizada: R${" "}
                    {activePrecoPersonalizado.preco_revenda
                      .toFixed(2)
                      .replace(".", ",")}
                  </Badge>
                </div>
              </div>
            ) : null
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
