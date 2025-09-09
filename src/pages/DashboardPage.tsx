import { DefaultLayout } from "@/components/layout/DefaultLayout";
import { Heading1, Heading2, Paragraph } from "@/components/ui/typography";

export function DashboardPage() {
  return (
    <DefaultLayout>
      <div className="w-full">
        <Heading1 className="mb-8">
          Dashboard - Pãozinho Delícia Gourmet
        </Heading1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <Heading2 className="mb-4">Produtos</Heading2>
            <Paragraph className="text-muted-foreground">
              Gerencie seus produtos da padaria
            </Paragraph>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <Heading2 className="mb-4">Clientes</Heading2>
            <Paragraph className="text-muted-foreground">
              Gerencie seus clientes
            </Paragraph>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <Heading2 className="mb-4">Vendas</Heading2>
            <Paragraph className="text-muted-foreground">
              Acompanhe suas vendas
            </Paragraph>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
