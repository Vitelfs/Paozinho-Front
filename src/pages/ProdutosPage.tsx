import { DefaultLayout } from "@/components/layout/DefaultLayout";

export function ProdutosPage() {
  return (
    <DefaultLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Produtos</h1>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Novo Produto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Pães</h2>
            <p className="text-gray-600 mb-4">Pães artesanais e tradicionais</p>
            <div className="text-sm text-gray-500">
              <span className="font-medium">Estoque:</span> 45 unidades
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Doces</h2>
            <p className="text-gray-600 mb-4">Doces e sobremesas</p>
            <div className="text-sm text-gray-500">
              <span className="font-medium">Estoque:</span> 23 unidades
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Salgados
            </h2>
            <p className="text-gray-600 mb-4">Salgados e lanches</p>
            <div className="text-sm text-gray-500">
              <span className="font-medium">Estoque:</span> 67 unidades
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
