# Página de Novo Cliente

Esta página implementa um formulário completo para cadastro de novos clientes usando as melhores práticas do React.

## 🛠️ Tecnologias Utilizadas

- **React Hook Form**: Gerenciamento de estado do formulário
- **Zod**: Validação de dados com TypeScript
- **shadcn/ui**: Componentes de interface padronizados
- **React Router**: Navegação entre páginas

## 📋 Campos do Formulário

### Nome Completo

- **Validação**: 2-100 caracteres, apenas letras e espaços
- **Regex**: `/^[a-zA-ZÀ-ÿ\s]+$/`
- **Obrigatório**: Sim

### Contato

- **Validação**: 10-20 caracteres, apenas números e símbolos de telefone
- **Regex**: `/^[\d\s\(\)\-\+]+$/`
- **Placeholder**: `(11) 99999-9999`
- **Obrigatório**: Sim

### Endereço

- **Validação**: 10-200 caracteres
- **Tipo**: Textarea para endereços completos
- **Obrigatório**: Sim

## 🎨 Design e UX

### Layout

- **Card centralizado** com largura máxima de 4xl
- **Cabeçalho** com botão de voltar e título
- **Formulário** organizado em seções claras
- **Botões de ação** alinhados à direita

### Componentes Visuais

- **Ícones**: User, Phone, MapPin para identificação visual
- **Estados**: Loading, disabled, error states
- **Feedback**: Mensagens de validação em tempo real
- **Responsividade**: Adaptável a diferentes tamanhos de tela

## 🔄 Fluxo de Funcionamento

### 1. Validação em Tempo Real

```tsx
const form = useForm<ClienteFormData>({
  resolver: zodResolver(clienteSchema),
  defaultValues: {
    nome: "",
    contato: "",
    endereco: "",
  },
});
```

### 2. Submissão do Formulário

```tsx
const onSubmit = async (data: ClienteFormData) => {
  setIsSubmitting(true);

  try {
    // Simular chamada para API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Redirecionar para a lista de clientes
    navigate("/clientes");
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
  } finally {
    setIsSubmitting(false);
  }
};
```

### 3. Navegação

- **Cancelar**: Volta para `/clientes`
- **Sucesso**: Redireciona para `/clientes` após salvar
- **Botão voltar**: Navegação intuitiva no cabeçalho

## 📱 Responsividade

### Mobile

- Formulário ocupa toda a largura disponível
- Botões empilhados verticalmente se necessário
- Textarea com altura mínima adequada

### Desktop

- Formulário centralizado com largura máxima
- Botões lado a lado
- Espaçamento otimizado

## 🔧 Customização

### Adicionando Novos Campos

1. **Atualizar schema Zod**:

```tsx
export const clienteSchema = z.object({
  // ... campos existentes
  email: z.string().email("Email inválido").optional(),
});
```

2. **Adicionar campo no formulário**:

```tsx
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input type="email" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Modificando Validações

```tsx
// No arquivo cliente.schema.ts
nome: z
  .string()
  .min(3, "Nome deve ter pelo menos 3 caracteres") // Alterar mínimo
  .max(50, "Nome deve ter no máximo 50 caracteres") // Alterar máximo
  .regex(/^[a-zA-Z\s]+$/, "Nome deve conter apenas letras"), // Alterar regex
```

## 🚀 Integração com API

### Preparação para API Real

```tsx
const onSubmit = async (data: ClienteFormData) => {
  setIsSubmitting(true);

  try {
    // Substituir por chamada real
    const response = await clienteService.create(data);

    // Tratar resposta da API
    if (response.success) {
      navigate("/clientes");
    } else {
      // Mostrar erro
      form.setError("root", { message: response.error });
    }
  } catch (error) {
    // Tratar erro de rede
    form.setError("root", { message: "Erro de conexão" });
  } finally {
    setIsSubmitting(false);
  }
};
```

## 🎯 Boas Práticas Implementadas

### ✅ Validação

- **Client-side**: Validação imediata com Zod
- **TypeScript**: Tipagem forte para todos os dados
- **UX**: Feedback visual em tempo real

### ✅ Acessibilidade

- **Labels**: Associados corretamente aos inputs
- **ARIA**: Atributos adequados para leitores de tela
- **Navegação**: Suporte a teclado completo

### ✅ Performance

- **Lazy loading**: Componentes carregados sob demanda
- **Debounce**: Validação otimizada
- **Estado mínimo**: Apenas estado necessário

### ✅ Manutenibilidade

- **Separação**: Schema, componente e lógica separados
- **Reutilização**: Componentes shadcn/ui padronizados
- **Documentação**: Código bem documentado
