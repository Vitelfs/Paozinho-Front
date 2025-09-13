import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ClientesPage } from "./pages/Clientes/ClientesPage";
import { NewClientePage } from "./pages/Clientes/NewClientePage";
import { ProdutoPage } from "./pages/Produtos/ProdutoPage";
import { NewProdutoPage } from "./pages/Produtos/NewProdutoPage";
import { EditProdutoPage } from "./pages/Produtos/EditProdutoPage";
import { PrecosPersonalizados } from "./pages/Produtos/PrecosPersonalizadosPage";
import { ClientePrecosPersonalizadosPage } from "./pages/Produtos/ClientePrecosPersonalizadosPage";
import { CategoriasPage } from "./pages/Categorias/CategoriasPage";
import { NewCategoriaPage } from "./pages/Categorias/NewCategoriaPage";
import { EditCategoriaPage } from "./pages/Categorias/EditCategoriaPage";
import { NotFoundPage } from "./pages/404Page";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoutes";
import { ThemeProvider } from "./routes/ThemeContext";
import { EditClientePage } from "./pages/Clientes/EditClientePage";
import { NewVenda } from "./pages/Vendas/NewVendaPage";
import { EditVenda } from "./pages/Vendas/EditVendaPage";
import { VendasPage } from "./pages/Vendas/VendasPage";
import { ProcessarPagamentoPage } from "./pages/Vendas/ProcessarPagamentoPage";
import { VendasRelatorioPage } from "./pages/Vendas/VendasRelatorioPage";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedRoute>
                  <ClientesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes/novo"
              element={
                <ProtectedRoute>
                  <NewClientePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes/editar"
              element={
                <ProtectedRoute>
                  <EditClientePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/produtos"
              element={
                <ProtectedRoute>
                  <ProdutoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/produtos/novo"
              element={
                <ProtectedRoute>
                  <NewProdutoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/produtos/editar"
              element={
                <ProtectedRoute>
                  <EditProdutoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/precos-personalizados"
              element={
                <ProtectedRoute>
                  <PrecosPersonalizados />
                </ProtectedRoute>
              }
            />
            <Route
              path="/precos-personalizados/cliente"
              element={
                <ProtectedRoute>
                  <ClientePrecosPersonalizadosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categorias"
              element={
                <ProtectedRoute>
                  <CategoriasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categorias/novo"
              element={
                <ProtectedRoute>
                  <NewCategoriaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categorias/editar"
              element={
                <ProtectedRoute>
                  <EditCategoriaPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendas/nova"
              element={
                <ProtectedRoute>
                  <NewVenda />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendas/editar/:id"
              element={
                <ProtectedRoute>
                  <EditVenda />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendas/processar-pagamento/:id"
              element={
                <ProtectedRoute>
                  <ProcessarPagamentoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendas/relatorio"
              element={
                <ProtectedRoute>
                  <VendasRelatorioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendas"
              element={
                <ProtectedRoute>
                  <VendasPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
