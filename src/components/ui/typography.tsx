import { cn } from "@/lib/utils";

// Tipografia baseada no design system do shadcn/ui
export const typographyVariants = {
  // Headings
  h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
  h2: "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
  h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
  h4: "scroll-m-20 text-xl font-semibold tracking-tight",
  h5: "scroll-m-20 text-lg font-semibold tracking-tight",
  h6: "scroll-m-20 text-base font-semibold tracking-tight",

  // Body text
  p: "leading-7 [&:not(:first-child)]:mt-6",
  lead: "text-xl text-muted-foreground",
  large: "text-lg font-semibold",
  small: "text-sm font-medium leading-none",
  muted: "text-sm text-muted-foreground",

  // Special text
  blockquote: "mt-6 border-l-2 pl-6 italic",
  list: "my-6 ml-6 list-disc [&>li]:mt-2",
  code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
  kbd: "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100",
} as const;

// Componentes de tipografia reutilizáveis
interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: keyof typeof typographyVariants;
  as?: React.ElementType;
}

export function Typography({
  variant = "p",
  as: Component = "p",
  className,
  children,
  ...props
}: TypographyProps) {
  const Element = Component as React.ElementType;
  return (
    <Element className={cn(typographyVariants[variant], className)} {...props}>
      {children}
    </Element>
  );
}

// Componentes específicos para facilitar o uso
export function Heading1({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn(typographyVariants.h1, className)} {...props} />;
}

export function Heading2({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn(typographyVariants.h2, className)} {...props} />;
}

export function Heading3({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn(typographyVariants.h3, className)} {...props} />;
}

export function Heading4({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn(typographyVariants.h4, className)} {...props} />;
}

export function Heading5({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn(typographyVariants.h5, className)} {...props} />;
}

export function Heading6({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h6 className={cn(typographyVariants.h6, className)} {...props} />;
}

export function Paragraph({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn(typographyVariants.p, className)} {...props} />;
}

export function Lead({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn(typographyVariants.lead, className)} {...props} />;
}

export function Large({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(typographyVariants.large, className)} {...props} />;
}

export function Small({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <small className={cn(typographyVariants.small, className)} {...props} />
  );
}

export function Muted({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn(typographyVariants.muted, className)} {...props} />;
}

export function Blockquote({
  className,
  ...props
}: React.HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className={cn(typographyVariants.blockquote, className)}
      {...props}
    />
  );
}

export function List({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn(typographyVariants.list, className)} {...props} />;
}

export function Code({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return <code className={cn(typographyVariants.code, className)} {...props} />;
}

export function Kbd({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return <kbd className={cn(typographyVariants.kbd, className)} {...props} />;
}

// Utilitários para cores de texto específicas do sistema
export const textColors = {
  primary: "text-foreground",
  secondary: "text-muted-foreground",
  accent: "text-accent-foreground",
  destructive: "text-destructive",
  success: "text-green-600",
  warning: "text-yellow-600",
  info: "text-blue-600",
} as const;

// Utilitários para pesos de fonte
export const fontWeights = {
  thin: "font-thin",
  light: "font-light",
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
  extrabold: "font-extrabold",
  black: "font-black",
} as const;

// Utilitários para tamanhos de fonte
export const fontSizes = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
  "6xl": "text-6xl",
} as const;
