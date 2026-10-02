import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { CartProvider } from './context/CartContext'
import { AdminLayout, EnConstruccion } from './pages/admin/AdminLayout'
import { BandejaPage } from './pages/admin/BandejaPage'
import { LoginPage } from './pages/admin/LoginPage'
import { ProductosAdminPage } from './pages/admin/ProductosAdminPage'
import { ArreglosPage } from './pages/ArreglosPage'
import { CarritoPage } from './pages/CarritoPage'
import { CatalogoPage } from './pages/CatalogoPage'
import { EncargosPage } from './pages/EncargosPage'
import { InicioPage } from './pages/InicioPage'
import { FaqPage, GaleriaPage, NoEncontradaPage, SobreMiPage } from './pages/InstitucionalPages'
import { ProductoPage } from './pages/ProductoPage'

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AdminAuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<InicioPage />} />
              <Route path="catalogo" element={<CatalogoPage />} />
              <Route path="catalogo/:slug" element={<ProductoPage />} />
              <Route path="carrito" element={<CarritoPage />} />
              <Route path="encargos" element={<EncargosPage />} />
              <Route path="arreglos" element={<ArreglosPage />} />
              <Route path="galeria" element={<GaleriaPage />} />
              <Route path="sobre-mi" element={<SobreMiPage />} />
              <Route path="preguntas-frecuentes" element={<FaqPage />} />
              <Route path="*" element={<NoEncontradaPage />} />
            </Route>

            <Route path="admin/login" element={<LoginPage />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="pedidos" replace />} />
              <Route path="pedidos" element={<BandejaPage key="pedidos" tipo="pedidos" />} />
              <Route path="encargos" element={<BandejaPage key="encargos" tipo="encargos" />} />
              <Route path="arreglos" element={<BandejaPage key="arreglos" tipo="arreglos" />} />
              <Route path="productos" element={<ProductosAdminPage />} />
              <Route path="galeria" element={<EnConstruccion titulo="Galería" />} />
            </Route>
          </Routes>
        </AdminAuthProvider>
      </CartProvider>
    </BrowserRouter>
  )
}
