import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './shared/components';
import { ProductsListPage, ProductDetailPage } from './features/products/pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ProductsListPage />} />
          <Route path="products" element={<ProductsListPage />} />
          <Route path="products/:id" element={<ProductDetailPage />} />
          <Route path="inventory" element={<div className="text-2xl p-6">Inventory Dashboard</div>} />
          <Route path="orders" element={<div className="text-2xl p-6">Orders</div>} />
          <Route path="suppliers" element={<div className="text-2xl p-6">Suppliers</div>} />
          <Route path="reports" element={<div className="text-2xl p-6">Reports</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
