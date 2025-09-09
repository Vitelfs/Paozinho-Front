// Exemplos de uso da tipografia do sistema
import {
  Typography,
  Heading1,
  Heading2,
  Heading3,
  Paragraph,
  Lead,
  Large,
  Small,
  Muted,
  Blockquote,
  List,
  Code,
  Kbd,
  textColors,
  fontWeights,
  fontSizes,
} from "@/components/ui/typography";

// Exemplo de uso básico
export function TypographyExample() {
  return (
    <div className="space-y-6 p-6">
      {/* Headings */}
      <Heading1>Título Principal</Heading1>
      <Heading2>Subtítulo</Heading2>
      <Heading3>Seção</Heading3>

      {/* Texto do corpo */}
      <Paragraph>
        Este é um parágrafo normal com texto do corpo. Ele tem espaçamento
        adequado e é fácil de ler.
      </Paragraph>

      {/* Texto destacado */}
      <Lead>
        Este é um texto de destaque que chama atenção para informações
        importantes.
      </Lead>

      {/* Texto grande */}
      <Large>Texto grande para destacar informações</Large>

      {/* Texto pequeno */}
      <Small>Texto pequeno para informações secundárias</Small>

      {/* Texto silenciado */}
      <Muted>Texto silenciado para informações menos importantes</Muted>

      {/* Citação */}
      <Blockquote>
        "Esta é uma citação importante que merece destaque visual."
      </Blockquote>

      {/* Lista */}
      <List>
        <li>Item da lista 1</li>
        <li>Item da lista 2</li>
        <li>Item da lista 3</li>
      </List>

      {/* Código */}
      <Code>console.log('Hello World')</Code>

      {/* Teclas */}
      <div className="flex gap-2">
        <Kbd>Ctrl</Kbd>
        <Kbd>+</Kbd>
        <Kbd>C</Kbd>
      </div>
    </div>
  );
}

// Exemplo de uso com cores personalizadas
export function TypographyWithColors() {
  return (
    <div className="space-y-4">
      <Typography variant="h3" className={textColors.primary}>
        Texto Primário
      </Typography>
      <Typography variant="p" className={textColors.secondary}>
        Texto Secundário
      </Typography>
      <Typography variant="p" className={textColors.success}>
        Texto de Sucesso
      </Typography>
      <Typography variant="p" className={textColors.destructive}>
        Texto de Erro
      </Typography>
    </div>
  );
}

// Exemplo de uso com pesos de fonte
export function TypographyWithWeights() {
  return (
    <div className="space-y-2">
      <Typography variant="p" className={fontWeights.thin}>
        Texto Thin
      </Typography>
      <Typography variant="p" className={fontWeights.light}>
        Texto Light
      </Typography>
      <Typography variant="p" className={fontWeights.normal}>
        Texto Normal
      </Typography>
      <Typography variant="p" className={fontWeights.medium}>
        Texto Medium
      </Typography>
      <Typography variant="p" className={fontWeights.semibold}>
        Texto Semibold
      </Typography>
      <Typography variant="p" className={fontWeights.bold}>
        Texto Bold
      </Typography>
    </div>
  );
}

// Exemplo de uso com tamanhos de fonte
export function TypographyWithSizes() {
  return (
    <div className="space-y-2">
      <Typography variant="p" className={fontSizes.xs}>
        Texto Extra Small
      </Typography>
      <Typography variant="p" className={fontSizes.sm}>
        Texto Small
      </Typography>
      <Typography variant="p" className={fontSizes.base}>
        Texto Base
      </Typography>
      <Typography variant="p" className={fontSizes.lg}>
        Texto Large
      </Typography>
      <Typography variant="p" className={fontSizes.xl}>
        Texto Extra Large
      </Typography>
    </div>
  );
}
