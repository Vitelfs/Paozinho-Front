# Sistema de Tipografia

Este arquivo contém o sistema de tipografia padronizado para o Sistema Pãozinho, baseado no design system do shadcn/ui.

## 📚 Componentes Disponíveis

### Headings

- `Heading1` - Título principal (4xl/5xl)
- `Heading2` - Subtítulo com borda inferior (3xl)
- `Heading3` - Seção (2xl)
- `Heading4` - Subseção (xl)
- `Heading5` - Item de seção (lg)
- `Heading6` - Item pequeno (base)

### Texto do Corpo

- `Paragraph` - Parágrafo padrão
- `Lead` - Texto de destaque
- `Large` - Texto grande
- `Small` - Texto pequeno
- `Muted` - Texto silenciado

### Elementos Especiais

- `Blockquote` - Citação com borda
- `List` - Lista com bullets
- `Code` - Código inline
- `Kbd` - Teclas do teclado

## 🎨 Utilitários

### Cores de Texto

```tsx
import { textColors } from "@/components/ui/typography";

// Uso com className
<Heading1 className={textColors.primary}>Título</Heading1>
<Paragraph className={textColors.secondary}>Texto secundário</Paragraph>
```

### Pesos de Fonte

```tsx
import { fontWeights } from "@/components/ui/typography";

<Paragraph className={fontWeights.bold}>Texto em negrito</Paragraph>;
```

### Tamanhos de Fonte

```tsx
import { fontSizes } from "@/components/ui/typography";

<Paragraph className={fontSizes.lg}>Texto grande</Paragraph>;
```

## 📖 Exemplos de Uso

### Uso Básico

```tsx
import { Heading1, Paragraph, Lead } from "@/components/ui/typography";

export function MinhaPage() {
  return (
    <div>
      <Heading1>Título da Página</Heading1>
      <Lead>Texto de destaque que introduz o conteúdo</Lead>
      <Paragraph>
        Este é um parágrafo normal com espaçamento adequado.
      </Paragraph>
    </div>
  );
}
```

### Uso com Variantes

```tsx
import { Typography } from "@/components/ui/typography";

export function ExemploVariantes() {
  return (
    <div>
      <Typography variant="h1">Título como H1</Typography>
      <Typography variant="lead">Texto de destaque</Typography>
      <Typography variant="muted">Texto silenciado</Typography>
    </div>
  );
}
```

### Uso com Elementos Customizados

```tsx
import { Typography } from "@/components/ui/typography";

export function ElementoCustomizado() {
  return (
    <Typography variant="h2" as="div">
      H2 renderizado como div
    </Typography>
  );
}
```

## 🎯 Boas Práticas

### 1. Hierarquia Consistente

- Use `Heading1` apenas uma vez por página
- Mantenha a hierarquia lógica (H1 > H2 > H3...)
- Use `Lead` para introduzir seções importantes

### 2. Espaçamento

- Os componentes já incluem espaçamento adequado
- Use `className` para ajustes específicos quando necessário
- Mantenha consistência entre páginas

### 3. Acessibilidade

- Os componentes usam elementos semânticos corretos
- Mantenha contraste adequado com as cores do sistema
- Use `text-muted-foreground` para informações secundárias

### 4. Responsividade

- Os tamanhos são responsivos por padrão
- `Heading1` ajusta automaticamente (4xl em mobile, 5xl em desktop)
- Use breakpoints específicos quando necessário

## 🔧 Customização

### Adicionando Novas Variantes

```tsx
// No arquivo typography.tsx
export const typographyVariants = {
  // ... variantes existentes
  custom: "text-lg font-bold text-blue-600",
} as const;
```

### Criando Componentes Específicos

```tsx
export function CustomHeading({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-2xl font-bold text-blue-600 border-b-2 border-blue-200 pb-2",
        className
      )}
      {...props}
    />
  );
}
```

## 📱 Responsividade

O sistema de tipografia é totalmente responsivo:

- **Mobile**: Tamanhos otimizados para telas pequenas
- **Tablet**: Ajustes automáticos para telas médias
- **Desktop**: Tamanhos maiores para telas grandes

## 🎨 Integração com Design System

A tipografia está integrada com:

- **Cores do sistema** (foreground, muted-foreground, etc.)
- **Espaçamento consistente** com o resto da aplicação
- **Tema dark/light** automático
- **Componentes shadcn/ui** para consistência visual
