import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import MovementPage from "./pages/MovementPage";
import MoveHistory from "./pages/MoveHistory";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={localStorage.getItem("stocksenseToken") ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />

        <Route path="/operations/receipts" element={<ProtectedRoute><MovementPage type="RECEIPT" title="Receipts" description="Record incoming stock arriving from suppliers." icon="↓" quantityLabel="Quantity Received" referenceLabel="Supplier / PO Reference" /></ProtectedRoute>} />
        <Route path="/operations/deliveries" element={<ProtectedRoute><MovementPage type="DELIVERY" title="Delivery Orders" description="Ship stock out to customers." icon="↑" quantityLabel="Quantity to Deliver" referenceLabel="Sales Order Reference" /></ProtectedRoute>} />
        <Route path="/operations/transfers" element={<ProtectedRoute><MovementPage type="TRANSFER" title="Internal Transfers" description="Move stock between warehouses or locations." icon="⇄" quantityLabel="Quantity to Transfer" referenceLabel="Reference" showLocations /></ProtectedRoute>} />
        <Route path="/operations/adjustments" element={<ProtectedRoute><MovementPage type="ADJUSTMENT" title="Inventory Adjustments" description="Reconcile recorded stock with the physical count." icon="±" quantityLabel="Counted Quantity" referenceLabel="Reason for Adjustment" /></ProtectedRoute>} />
        <Route path="/operations/move-history" element={<ProtectedRoute><MoveHistory /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
