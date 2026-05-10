import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Questions from './pages/Questions';
import Reviews from './pages/Reviews';
import Products from './pages/Products';
import CreateProduct from './pages/CreateProduct';
import Customers from './pages/Customers';
import Categories from './pages/Categories';
import DeliveryPersonnel from './pages/DeliveryPersonnel';
import CourierDashboard from './pages/CourierDashboard';
import CourierOrderDetail from './pages/CourierOrderDetail';
import Login from './pages/Login';

interface ProtectedRouteProps {
  children: JSX.Element;
}

function isRole(role: string) {
  return !!localStorage.getItem('access_token') && localStorage.getItem('role') === role;
}

function AdminRoute({ children }: ProtectedRouteProps) {
  return isRole('admin') ? children : <Navigate to="/login" replace />;
}

function CourierRoute({ children }: ProtectedRouteProps) {
  return isRole('delivery_personnel') ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Courier routes — no MainLayout */}
        <Route
          path="/courier/dashboard"
          element={<CourierRoute><CourierDashboard /></CourierRoute>}
        />
        <Route
          path="/courier/orders/:orderId"
          element={<CourierRoute><CourierOrderDetail /></CourierRoute>}
        />

        {/* Admin routes with MainLayout */}
        <Route
          element={
            <AdminRoute>
              <MainLayout />
            </AdminRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/create" element={<CreateProduct />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/delivery-personnel" element={<DeliveryPersonnel />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;