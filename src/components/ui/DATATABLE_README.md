# DataTable System

Sistema de tabelas genérico e reutilizável baseado no TanStack Table, desenvolvido para padronizar a exibição de dados em toda a aplicação.

## 🚀 Características

- **Genérico e Flexível**: Funciona com qualquer tipo de dados
- **TanStack Table**: Utiliza a biblioteca mais robusta para tabelas em React
- **Padronizado**: Interface consistente em toda a aplicação
- **Performance**: Otimizado com memoização e hooks eficientes
- **Acessível**: Suporte completo a acessibilidade
- **Responsivo**: Funciona bem em dispositivos móveis

## 📦 Componentes Principais

### DataTable

Componente principal que renderiza a tabela com todas as funcionalidades.

### TableSkeleton

Skeleton de loading padronizado para estados de carregamento.

### EmptyState

Componente para exibir estados vazios de forma consistente.

### ConfirmDeleteDialog

Dialog de confirmação reutilizável para exclusões.

## 🎣 Hooks Disponíveis

### useDataTable

Hook principal que integra paginação, filtros e operações CRUD.

### usePagination

Gerencia estado de paginação de forma padronizada.

### useFilters

Gerencia filtros de forma eficiente.

### useCrudOperations

Padroniza operações de criação, atualização e exclusão.

## 📝 Como Usar

### 1. Definir Colunas

```tsx
import { createClienteColumns } from "@/components/clientes/cliente-columns";

const columns = useMemo(() => createClienteColumns(), []);
```

### 2. Definir Ações

```tsx
import { createClienteActions } from "@/components/clientes/cliente-columns";

const actions = useMemo(
  () => createClienteActions(handleEdit, handleDelete, handleChangeStatus),
  []
);
```

### 3. Usar o Hook Principal

```tsx
import { useDataTable } from "@/hooks/use-data-table";

const { pagination, filters, search, crud, handleRetry, updateTotalItems } =
  useDataTable({
    itemsPerPage: 10,
    initialFilters: { status: "todos" },
  });
```

### 4. Renderizar a Tabela

```tsx
import { DataTable } from "@/components/ui/data-table";

<DataTable
  data={clientes}
  columns={columns}
  loading={loading}
  error={error}
  onRetry={handleRetry}
  pagination={pagination}
  filters={clienteFilters}
  onFilterChange={filters.onChange}
  filterValues={filters.values}
  search={search}
  actions={actions}
  emptyMessage="Nenhum cliente encontrado"
  emptyDescription="Não há clientes cadastrados no momento."
/>;
```

## 🔧 Configuração de Colunas

```tsx
export const createClienteColumns = (): DataTableColumn<ClienteEntity>[] => [
  {
    id: "nome",
    header: "Nome",
    accessorKey: "nome",
    enableSorting: true,
    cell: ({ row }) => <div className="font-medium">{row.original.nome}</div>,
  },
  // ... mais colunas
];
```

## 🎯 Configuração de Ações

```tsx
export const createClienteActions = (
  onEdit?: (cliente: ClienteEntity) => void,
  onDelete?: (cliente: { id: string }) => void
): DataTableAction<ClienteEntity>[] => [
  {
    id: "edit",
    label: "Editar",
    icon: Edit,
    onClick: (cliente) => onEdit?.(cliente),
  },
  {
    id: "delete",
    label: "Excluir",
    icon: Trash2,
    variant: "destructive",
    onClick: (cliente) => onDelete?.({ id: cliente.id }),
  },
];
```

## 🔍 Configuração de Filtros

```tsx
export const clienteFilters: DataTableFilter[] = [
  {
    id: "status",
    label: "Status",
    type: "select",
    placeholder: "Filtrar por status",
    options: [
      { label: "Todos", value: "todos" },
      { label: "Ativo", value: "ativo" },
      { label: "Inativo", value: "inativo" },
    ],
    defaultValue: "todos",
  },
];
```

## ⚡ Otimizações de Performance

- **React.memo**: Componentes memoizados para evitar re-renderizações
- **useMemo**: Colunas e ações memoizadas
- **useCallback**: Handlers memoizados
- **TanStack Table**: Virtualização e otimizações internas

## 🎨 Customização

O sistema é altamente customizável:

- **Colunas**: Defina como os dados são exibidos
- **Ações**: Configure ações por linha e em massa
- **Filtros**: Adicione filtros personalizados
- **Estados**: Customize loading, erro e vazio
- **Estilos**: Use classes CSS personalizadas

## 📱 Responsividade

- Layout adaptativo para mobile
- Filtros empilhados em telas pequenas
- Paginação otimizada para touch
- Ações em dropdown para economizar espaço

## ♿ Acessibilidade

- Suporte completo a leitores de tela
- Navegação por teclado
- ARIA labels apropriados
- Contraste adequado

## 🧪 Testes

O sistema foi projetado para ser facilmente testável:

- Hooks isolados e testáveis
- Componentes com props bem definidas
- Separação clara de responsabilidades
