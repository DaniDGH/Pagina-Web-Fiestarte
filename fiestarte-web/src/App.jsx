import { Routes, Route } from "react-router-dom";
import Login from "./components/pages/Login/Login";
import Home from "./components/pages/Home/Home";
import Billing from "./components/pages/Billing/Billing";
import Agenda from "./components/pages/Agenda/Agenda";
import ProtectedRoute from "./components/ProtectedRoute";
import Inventory from "./components/pages/Inventory/Inventory";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/inicio"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/facturacion"
        element={
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agenda"
        element={
          <ProtectedRoute>
            <Agenda />
          </ProtectedRoute>
        }
      />
      <Route
  path="/prendas"
  element={
    <ProtectedRoute>
      <Inventory />
    </ProtectedRoute>
  }
/>
    </Routes>
  );
}

export default App;